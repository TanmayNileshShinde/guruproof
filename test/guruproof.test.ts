import assert from "node:assert/strict";
import http from "node:http";
import "dotenv/config";
import app from "../server/app";
import { CURRICULUM_TOPICS } from "../server/curriculum";

async function jsonRequest<T>(baseUrl: string, path: string, options?: RequestInit): Promise<{ status: number; body: T }> {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = (await res.json()) as T;
  return { status: res.status, body };
}

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  assert(address && typeof address !== "string", "Failed to bind test HTTP server");
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  let passed = 0;
  async function test(name: string, fn: () => Promise<void>) {
    await fn();
    passed += 1;
    console.log(`✓ ${name}`);
  }

  try {
    await test("GET /api/health returns healthy status and integration flags", async () => {
      const { status, body } = await jsonRequest<any>(baseUrl, "/health");
      assert.equal(status, 200);
      assert.equal(body.status, "healthy");
      assert.equal(typeof body.integrations?.olostep, "boolean");
    });

    await test("GET /api/topics returns all 4 multilingual DSA labs", async () => {
      const { status, body } = await jsonRequest<any>(baseUrl, "/topics");
      assert.equal(status, 200);
      assert.equal(body.success, true);
      assert.equal(body.topics.length, 4);
      for (const topic of body.topics) {
        assert.ok(topic.preQuiz.question.en);
        assert.ok(topic.preQuiz.question.hinglish);
        assert.ok(topic.preQuiz.question.hi);
        assert.equal(topic.transferTest.options.en.length, 4);
      }
    });

    await test("POST /api/diagnose detects misconception in Hinglish without leaking solution", async () => {
      const { status, body } = await jsonRequest<any>(baseUrl, "/diagnose", {
        method: "POST",
        body: JSON.stringify({
          topicId: "circular-linked-list",
          language: "hinglish",
          preAnswerIndex: 0,
          hintLevel: 1,
        }),
      });
      assert.equal(status, 200);
      assert.equal(body.success, true);
      assert.equal(body.data.preCorrect, false);
      assert.equal(body.data.preScorePct, 25);
      assert.equal(body.data.language, "hinglish");
      assert.equal(body.data.spoilerGuardrailPassed, true);
      assert.ok(body.data.visualTrace.length >= 4);
      assert.ok(body.data.citations.length >= 1);
    });

    await test("POST /api/diagnose supports custom snippet analysis in English", async () => {
      const { status, body } = await jsonRequest<any>(baseUrl, "/diagnose", {
        method: "POST",
        body: JSON.stringify({
          topicId: "custom",
          language: "en",
          preAnswerIndex: 1,
          hintLevel: 2,
          customCode: `int mid = left + (right - left) / 2;\nwhile (left <= right) { left = mid; }`,
        }),
      });
      assert.equal(status, 200);
      assert.equal(body.data.topicId, "custom");
      assert.equal(body.data.hintLevel, 2);
      assert.equal(body.data.spoilerGuardrailPassed, true);
      assert.match(body.data.misconceptionDetected, /Binary Search/i);
    });

    await test("POST /api/verify-fix rejects buggy code and passes corrected invariants across all 4 labs", async () => {
      const fixes: Record<string, string> = {
        "circular-linked-list": `static void insertBeginning(int data) {
          Node newNode = new Node(data);
          if (head == null) {
            head = newNode;
            newNode.next = head;
            return;
          }
          Node temp = head;
          while (temp.next != head) { temp = temp.next; }
          newNode.next = head;
          temp.next = newNode;
          head = newNode;
        }`,
        "binary-search": `int binarySearch(int[] arr, int target) {
          int left = 0, right = arr.length - 1;
          while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
          }
          return -1;
        }`,
        "postfix-stack": `int b = stack.pop();
          int a = stack.pop();
          stack.push(calculate(a, b, ch));`,
        "recursion-base": `static int oddStepSum(int n) {
          if (n <= 0) return 0;
          return n + oddStepSum(n - 2);
        }`,
      };

      for (const topic of CURRICULUM_TOPICS) {
        const failRes = await jsonRequest<any>(baseUrl, "/verify-fix", {
          method: "POST",
          body: JSON.stringify({ topicId: topic.id, fixedCode: topic.buggyCode, language: "en" }),
        });
        assert.equal(failRes.status, 200);
        assert.equal(failRes.body.data.passed, false, `Expected buggy code to fail for ${topic.id}`);
        assert.equal(failRes.body.data.readyForTransferTest, false);

        const passRes = await jsonRequest<any>(baseUrl, "/verify-fix", {
          method: "POST",
          body: JSON.stringify({ topicId: topic.id, fixedCode: fixes[topic.id], language: "en" }),
        });
        assert.equal(passRes.status, 200);
        assert.equal(passRes.body.data.passed, true, `Expected fixed code to pass for ${topic.id}`);
        assert.equal(passRes.body.data.readyForTransferTest, true);
      }
    });

    await test("POST /api/transfer-check computes Verified Mastery and Mastery Delta correctly", async () => {
      const topic = CURRICULUM_TOPICS[0];
      const wrongRes = await jsonRequest<any>(baseUrl, "/transfer-check", {
        method: "POST",
        body: JSON.stringify({
          topicId: topic.id,
          preScorePct: 25,
          hintsUsed: 2,
          selectedIndex: (topic.transferTest.correctIndex + 1) % 4,
          language: "hi",
        }),
      });
      assert.equal(wrongRes.status, 200);
      assert.equal(wrongRes.body.data.verdict, "NEEDS PRACTICE");

      const rightRes = await jsonRequest<any>(baseUrl, "/transfer-check", {
        method: "POST",
        body: JSON.stringify({
          topicId: topic.id,
          preScorePct: 25,
          hintsUsed: 2,
          selectedIndex: topic.transferTest.correctIndex,
          language: "hi",
        }),
      });
      assert.equal(rightRes.status, 200);
      assert.equal(rightRes.body.data.verdict, "VERIFIED MASTERY");
      assert.equal(rightRes.body.data.postScorePct, 100);
      assert.equal(rightRes.body.data.masteryDeltaPct, 75);
      assert.equal(rightRes.body.data.pedagogicalEval.spoilerLeakPct, 0);
    });

    await test("GET /api/evals passes 100% with 0% spoiler leakage", async () => {
      const { status, body } = await jsonRequest<any>(baseUrl, "/evals");
      assert.equal(status, 200);
      assert.equal(body.data.suitePassed, true);
      assert.equal(body.data.metrics.spoilerLeakagePct, 0);
      assert.equal(body.data.metrics.diagnosticCatchRatePct, 100);
      assert.equal(body.data.metrics.multilingualCoveragePct, 100);
    });

    console.log(`\nAll ${passed} GuruProof test suites passed!`);
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
