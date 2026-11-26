export type TutorLanguage = "en" | "hinglish" | "hi";

export interface VisualTraceStep {
  step: number;
  label: string;
  state: string;
  isError?: boolean;
}

export interface DiagnosticTopic {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate";
  buggyCode: string;
  bugLine: number;
  expectedConcept: string;
  preQuiz: {
    question: Record<TutorLanguage, string>;
    options: Record<TutorLanguage, string[]>;
    correctIndex: number;
  };
  misconception: {
    id: string;
    name: Record<TutorLanguage, string>;
    diagnosis: Record<TutorLanguage, string>;
    hints: Record<TutorLanguage, [string, string, string]>;
  };
  visualTraceBuggy: VisualTraceStep[];
  visualTraceFixed: VisualTraceStep[];
  transferTest: {
    question: Record<TutorLanguage, string>;
    options: Record<TutorLanguage, string[]>;
    correctIndex: number;
    explanation: Record<TutorLanguage, string>;
  };
  docSearchQuery: string;
}

export const CURRICULUM_TOPICS: DiagnosticTopic[] = [
  {
    id: "circular-linked-list",
    title: "Circular Linked List: Tail Relinking Bug",
    category: "Pointers & Linked Structures",
    difficulty: "Intermediate",
    bugLine: 11,
    expectedConcept: "Preserve reference to current head while walking to tail before updating head = newNode.",
    buggyCode: `static void insertBeginning(int data) {
    Node newNode = new Node(data);
    if (head == null) {
        head = newNode;
        newNode.next = head;
        return;
    }
    // BUG: Updating head before relinking the tail!
    newNode.next = head;
    head = newNode;
    Node temp = head;
    while (temp.next != head) {
        temp = temp.next;
    }
    temp.next = head;
}`,
    preQuiz: {
      question: {
        en: "In a non-empty Circular Linked List [10 -> 20 -> 30 -> (10)], what happens if you set `head = newNode` BEFORE walking `temp` to the tail?",
        hinglish: "Non-empty Circular Linked List [10 -> 20 -> 30 -> (10)] mein agar `temp` se tail dhundhne se PEHLE `head = newNode` kar diya, toh kya hoga?",
        hi: "एक Circular Linked List [10 -> 20 -> 30 -> (10)] में यदि आप tail तक पहुँचने से पहले `head = newNode` कर देते हैं, तो क्या होगा?"
      },
      options: {
        en: [
          "It inserts cleanly in O(1) time",
          "The loop `temp.next != head` never terminates (infinite loop) because old tail still points to old head",
          "Java garbage collects the tail automatically",
          "It reverses the entire list"
        ],
        hinglish: [
          "O(1) time mein cleanly insert ho jayega",
          "`temp.next != head` loop kabhi khatam hi nahi hoga (infinite loop) kyunki purani tail abhi bhi purane head ko point karti hai",
          "Java garbage collector tail delete kar dega",
          "Poori list reverse ho jayegi"
        ],
        hi: [
          "यह O(1) समय में सही ढंग से जुड़ जाएगा",
          "लूप `temp.next != head` कभी समाप्त नहीं होगा (अनंत लूप) क्योंकि पुरानी tail अभी भी पुराने head की ओर इशारा कर रही है",
          "Java अपने आप tail हटा देगा",
          "पूरी सूची उलट जाएगी"
        ]
      },
      correctIndex: 1
    },
    misconception: {
      id: "premature-pointer-overwrite",
      name: {
        en: "Premature Head Overwrite Before Tail Traversal",
        hinglish: "Tail dhundhne se pehle hi `head` pointer badal dena",
        hi: "Tail तक जाने से पहले ही `head` पॉइंटर बदल देना"
      },
      diagnosis: {
        en: "Line 10 reassigns `head = newNode` too early. When `while (temp.next != head)` runs from the new node, the old tail (`30`) still points to old head (`10`), never matching the new `head` (`5`).",
        hinglish: "Line 10 pe `head = newNode` bahut jaldi likh diya! Jab `while (temp.next != head)` chalta hai, purana tail node (`30`) abhi bhi purane head (`10`) ko point kar raha hota hai — naye `head` (`5`) ko kabhi match nahi karega!",
        hi: "पंक्ति 10 पर `head = newNode` बहुत पहले कर दिया गया है। जब लूप चलता है, तो पुराना अंतिम नोड (`30`) अभी भी पुराने `head` (`10`) को इंगित करता है, इसलिए लूप कभी नहीं रुकता।"
      },
      hints: {
        en: [
          "Look at lines 9–11: once you change `head = newNode`, which node does the old tail (`30`) still point to?",
          "Trace `temp` starting from `newNode`: `newNode -> 10 -> 20 -> 30 -> 10 -> 20 -> 30...` Notice it skips `newNode` forever! Which 2 operations need to swap order?",
          "Find the tail `while (temp.next != head)` FIRST while `head` still points to `10`. Only AFTER `temp.next = newNode`, update `head = newNode`."
        ],
        hinglish: [
          "Lines 9-11 dhyan se dekho: ek baar `head = newNode` kar diya, toh purana tail node (`30`) abhi bhi kis node ko point kar raha hai?",
          "Dry-run karo: `newNode (5) -> 10 -> 20 -> 30 -> 10 -> 20 -> 30...` Dekho `30` wapas `5` pe kabhi aata hi nahi! Kin 2 steps ka order swap hona chahiye?",
          "Pehle purane `head` (`10`) se `while (temp.next != head)` chalakar tail (`30`) dhundho, phir `temp.next = newNode` aur `newNode.next = head` karke LAST mein `head = newNode` karo."
        ],
        hi: [
          "पंक्तियाँ 9-11 ध्यान से देखें: जब आप `head = newNode` बदल देते हैं, तो पुराना अंतिम नोड (`30`) अभी भी किस नोड की ओर संकेत करता है?",
          "`temp` को ट्रेस करें: `5 -> 10 -> 20 -> 30 -> 10 -> 20...` यह कभी `5` पर वापस नहीं आता! किन दो चरणों का क्रम बदलना होगा?",
          "पहले पुराने `head` का उपयोग करके अंतिम नोड (`30`) खोजें (`while (temp.next != head)`), फिर `temp.next = newNode` जोड़ें और अंत में `head = newNode` सेट करें।"
        ]
      }
    },
    visualTraceBuggy: [
      { step: 1, label: "Initial Circle", state: "head=10 -> 20 -> 30 -> (back to 10)" },
      { step: 2, label: "newNode(5).next = head", state: "5 -> 10 -> 20 -> 30 -> 10" },
      { step: 3, label: "head = newNode (BUG!)", state: "head is now 5, but 30.next is STILL 10!", isError: true },
      { step: 4, label: "while(temp.next != 5)", state: "Loop spins 5->10->20->30->10->20... INFINITE LOOP", isError: true }
    ],
    visualTraceFixed: [
      { step: 1, label: "Start at old head", state: "temp = 10, head = 10" },
      { step: 2, label: "Walk to tail", state: "while(temp.next != 10) stops at temp = 30" },
      { step: 3, label: "Link newNode & tail", state: "newNode(5).next = 10; 30.next = 5" },
      { step: 4, label: "Move head safely", state: "head = 5 -> 10 -> 20 -> 30 -> (back to 5) ✓" }
    ],
    transferTest: {
      question: {
        en: "Transfer Test (Unseen): You are implementing `deleteBeginning()` on a Circular Linked List `[10 -> 20 -> 30 -> (10)]`. What MUST happen before updating `head = head.next`?",
        hinglish: "Transfer Test (Naya Sawal): Agar aap Circular Linked List `[10 -> 20 -> 30 -> (10)]` mein `deleteBeginning()` likh rahe ho, toh `head = head.next` karne se PEHLE kya zaroori hai?",
        hi: "Transfer Test (नया प्रश्न): Circular Linked List `[10 -> 20 -> 30 -> (10)]` में `deleteBeginning()` लिखते समय, `head = head.next` करने से पहले क्या आवश्यक है?"
      },
      options: {
        en: [
          "Walk `temp` to tail (`30`) while `temp.next != head`, so you can relink `temp.next = head.next`",
          "Set `head.next = null` immediately",
          "Sort the array inside the node",
          "Increment `head.data` by 1"
        ],
        hinglish: [
          "Pehle `temp` ko tail (`30`) tak le jao (`temp.next != head`) taaki baad mein `temp.next = head.next` kar sako",
          "Turant `head.next = null` kar do",
          "Node ki values sort kar do",
          "`head.data` ko +1 kar do"
        ],
        hi: [
          "पहले `temp` को अंतिम नोड (`30`) तक ले जाएं (`temp.next != head`) ताकि बाद में `temp.next = head.next` जोड़ा जा सके",
          "तुरंत `head.next = null` कर दें",
          "नोड के डेटा को सॉर्ट करें",
          "`head.data` में 1 जोड़ें"
        ]
      },
      correctIndex: 0,
      explanation: {
        en: "Exact same principle! Once `head` moves to `20`, you lose the loop stop condition (`temp.next != 10`) to locate tail `30`. Walking to tail BEFORE moving `head` preserves circle integrity.",
        hinglish: "Bilkul sahi! Ek baar `head` ko `20` pe move kar diya toh purane tail (`30`) ko pakadne ka reference kho doge. Isliye hamesha tail locate karke hi `head` update karo!",
        hi: "बिल्कुल सही! यदि `head` को पहले बदल दिया जाए, तो अंतिम नोड (`30`) खोजने की शर्त टूट जाती है। पहले tail खोजें, फिर `head` अपडेट करें।"
      }
    },
    docSearchQuery: "circular linked list insert at beginning java pointer bug"
  },
  {
    id: "binary-search",
    title: "Binary Search: Infinite Loop Boundary Bug",
    category: "Divide & Conquer",
    difficulty: "Beginner",
    bugLine: 8,
    expectedConcept: "Exclude checked `mid` (`left = mid + 1`) and use overflow-safe `left + (right - left) / 2`.",
    buggyCode: `static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) {
            // BUG: Keeping mid in search space!
            left = mid;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
    preQuiz: {
      question: {
        en: "Given `arr = [2, 8]` and `target = 10` (missing from array), what does `left = mid` cause at `left = 0, right = 1`?",
        hinglish: "Agar `arr = [2, 8]` aur `target = 10` hai, toh `left = 0, right = 1` pe `left = mid` likhne se kya hoga?",
        hi: "यदि `arr = [2, 8]` और `target = 10` है, तो `left = 0, right = 1` पर `left = mid` लिखने से क्या होगा?"
      },
      options: {
        en: [
          "Returns -1 cleanly in 2 steps",
          "`mid` rounds down to `0`, so `left` stays `0` forever (Infinite Loop!)",
          "Throws ArrayIndexOutOfBoundsException",
          "Returns index 1"
        ],
        hinglish: [
          "2 steps mein -1 return hoga",
          "`mid` floor hoke `0` aata hai, isliye `left` hamesha `0` hi rehta hai (Infinite Loop!)",
          "ArrayIndexOutOfBoundsException aayega",
          "Index 1 return hoga"
        ],
        hi: [
          "2 चरणों में -1 लौट आएगा",
          "`mid` का मान `0` आता है, इसलिए `left` हमेशा `0` ही रहता है (अनंत लूप!)",
          "ArrayIndexOutOfBoundsException आएगा",
          "इंडेक्स 1 लौटेगा"
        ]
      },
      correctIndex: 1
    },
    misconception: {
      id: "non-shrinking-search-window",
      name: {
        en: "Non-Shrinking Interval (`left = mid` Stagnation)",
        hinglish: "Search range shrink na hona (`left = mid` atak jana)",
        hi: "खोज अंतराल छोटा न होना (`left = mid` पर अटकना)"
      },
      diagnosis: {
        en: "When `left = 0` and `right = 1`, integer division `(0 + 1) / 2` equals `0` (`mid = left`). Since we already proved `arr[mid] < target`, keeping `left = mid` never shrinks the interval!",
        hinglish: "Jab `left = 0` aur `right = 1` hota hai, toh `(0 + 1) / 2` integer division se `0` aata hai (`mid == left`)! Hum check kar chuke hain ki `arr[mid]` target se chhota hai, phir bhi `left = mid` rakhne se range kabhi chhoti nahi hoti!",
        hi: "जब `left = 0` और `right = 1` होता है, तो `(0 + 1) / 2` का मान `0` (`mid = left`) आता है। चूँकि `arr[mid] < target` है, `left = mid` रखने से अंतराल कभी छोटा नहीं होता।"
      },
      hints: {
        en: [
          "Plug in `left = 0, right = 1` with `arr = [2, 8]` and `target = 10`. What value does `mid` compute to in Java integer division?",
          "You already checked `arr[mid] == target` (false) and `arr[mid] < target` (true). Does `mid` still need to stay inside `[left, right]`?",
          "Because `mid` is already ruled out, advance past it: set `left = mid + 1` (and prefer `left + (right - left) / 2` to avoid overflow)."
        ],
        hinglish: [
          "Values put karke dekho: `left = 0, right = 1`, `arr = [2, 8]`, `target = 10`. Java mein `(0 + 1) / 2` kitna hota hai?",
          "Hum check kar chuke hain ki `arr[mid]` target ke barabar nahi hai. Toh kya `mid` ko dobara range mein rakhne ki zaroorat hai?",
          "`mid` eliminate ho chuka hai, toh `left = mid + 1` likho (aur safe overflow-free mid ke liye `left + (right - left) / 2`)."
        ],
        hi: [
          "`left = 0, right = 1` और `target = 10` मान रखकर देखें: Java में `(0 + 1) / 2` का मान क्या होता है?",
          "हम पहले ही जाँच चुके हैं कि `arr[mid]` लक्ष्य नहीं है। क्या `mid` को फिर से खोज सीमा में रखने की आवश्यकता है?",
          "`mid` को बाहर करने के लिए `left = mid + 1` करें (और ओवरफ़्लो से बचने के लिए `left + (right - left) / 2` उपयोग करें)।"
        ]
      }
    },
    visualTraceBuggy: [
      { step: 1, label: "Window [L=0, R=1]", state: "arr=[2, 8], target=10" },
      { step: 2, label: "mid = (0 + 1) / 2", state: "mid = 0 -> arr[0] = 2 < 10" },
      { step: 3, label: "left = mid (BUG!)", state: "left is assigned 0 AGAIN! Window stays [0, 1]", isError: true },
      { step: 4, label: "Next iteration", state: "L=0, R=1 -> mid=0 -> left=0 -> INFINITE LOOP", isError: true }
    ],
    visualTraceFixed: [
      { step: 1, label: "Window [L=0, R=1]", state: "arr=[2, 8], target=10" },
      { step: 2, label: "mid = 0 + (1-0)/2", state: "mid = 0 -> arr[0] = 2 < 10" },
      { step: 3, label: "left = mid + 1", state: "L becomes 1; next mid=1 (arr[1]=8 < 10) -> L=2" },
      { step: 4, label: "Loop terminates", state: "L=2 > R=1 -> returns -1 cleanly ✓" }
    ],
    transferTest: {
      question: {
        en: "Transfer Test (Unseen): Find the FIRST index where `arr[i] >= target` (Lower Bound). When `arr[mid] >= target`, why do we set `right = mid` (instead of `mid - 1`), and what must the loop condition be so `right = mid` doesn't loop forever?",
        hinglish: "Transfer Test (Naya Sawal): Lower Bound mein pehla index dhundhna hai jahan `arr[i] >= target`. Jab `arr[mid] >= target`, toh `right = mid` rakhte hain — par infinite loop rokne ke liye `while` condition kya honi chahiye?",
        hi: "Transfer Test (नया प्रश्न): Lower Bound में जहाँ `arr[i] >= target` हो, वहाँ `right = mid` रखने पर अनंत लूप रोकने के लिए `while` की शर्त क्या होनी चाहिए?"
      },
      options: {
        en: [
          "`while (left < right)` — stops as soon as `left == right`, because `mid` rounds down toward `left`",
          "`while (left <= right)` — same as normal binary search",
          "`while (left != right + 1)`",
          "Set `mid = (left + right + 1) / 2` with `right = mid`"
        ],
        hinglish: [
          "`while (left < right)` — jaise hi `left == right` hoga loop ruk jayega, kyunki floor division mein `mid` kabhi `right` ke barabar nahi aata jab `left < right`",
          "`while (left <= right)` — normal binary search jaisa",
          "`while (left != right + 1)`",
          "`mid = (left + right + 1) / 2` aur `right = mid`"
        ],
        hi: [
          "`while (left < right)` — जैसे ही `left == right` होगा, लूप रुक जाएगा क्योंकि `left < right` होने पर floor विभाजन में `mid` कभी `right` के बराबर नहीं होता",
          "`while (left <= right)` — सामान्य बाइनरी सर्च जैसा",
          "`while (left != right + 1)`",
          "`mid = (left + right + 1) / 2` और `right = mid`"
        ]
      },
      correctIndex: 0,
      explanation: {
        en: "Nailed it! With floor mid `(left + right) / 2`, when `left < right`, `mid` is strictly `< right` (`right = mid` ALWAYS shrinks!). Stopping at `left == right` avoids infinite loop at 1 element.",
        hinglish: "Ekdam sahi! Floor division mein jab tak `left < right` hai, `mid < right` hamesha guarantee hai — toh `right = mid` hamesha window chhoti karega. Aur `left == right` pe loop stop ho jayega!",
        hi: "सटीक उत्तर! `left < right` रहते हुए `mid` हमेशा `right` से छोटा होता है, इसलिए `right = mid` अंतराल को हमेशा छोटा करता है और `left == right` पर रुक जाता है।"
      }
    },
    docSearchQuery: "binary search infinite loop left equals mid java"
  },
  {
    id: "postfix-stack",
    title: "Postfix Stack: Operand Pop Order Bug",
    category: "Stacks & Expression Parsing",
    difficulty: "Beginner",
    bugLine: 7,
    expectedConcept: "LIFO stack pops the RIGHT operand (`b`) first, then the LEFT operand (`a`), then computes `a op b`.",
    buggyCode: `// Evaluate expression like "82-" -> expected 8 - 2 = 6
if (Character.isDigit(ch)) {
    stack.push(ch - '0');
} else {
    // BUG: Operand pop order reversed for subtraction/division!
    int a = stack.pop();
    int b = stack.pop();
    int result = calculate(a, b, ch);
    stack.push(result);
}`,
    preQuiz: {
      question: {
        en: "For postfix `82-` (meaning `8 - 2 = 6`), what does the buggy code above output?",
        hinglish: "Postfix `82-` (matlab `8 - 2 = 6`) ke liye upar diya gaya buggy code kya result dega?",
        hi: "Postfix `82-` (अर्थात `8 - 2 = 6`) के लिए ऊपर दिया गया बग वाला कोड क्या परिणाम देगा?"
      },
      options: {
        en: [
          "6 (correct)",
          "-6 (because `2` is popped into `a` and `8` into `b`, computing `2 - 8`)",
          "10",
          "EmptyStackException"
        ],
        hinglish: [
          "6 (sahi)",
          "-6 (kyunki stack pehle `2` ko `a` mein aur `8` ko `b` mein pop karta hai, toh `2 - 8` ho jata hai)",
          "10",
          "EmptyStackException"
        ],
        hi: [
          "6 (सही)",
          "-6 (क्योंकि स्टैक पहले `2` को `a` में और `8` को `b` में निकालता है, जिससे `2 - 8` होता है)",
          "10",
          "EmptyStackException"
        ]
      },
      correctIndex: 1
    },
    misconception: {
      id: "lifo-operand-reversal",
      name: {
        en: "LIFO Stack Operand Order Reversal (`a` vs `b`)",
        hinglish: "LIFO Stack mein `a` aur `b` ka order ulta ho jana",
        hi: "LIFO स्टैक में ऑपरेंड `a` और `b` का क्रम उलटना"
      },
      diagnosis: {
        en: "In `" + "82-" + "`, `8` is pushed first (bottom) and `2` is pushed second (top). Stack follows LIFO (Last-In First-Out), so the first `pop()` returns the RIGHT operand (`2`), not the left operand (`8`)!",
        hinglish: "`82-` mein pehle `8` push hua, phir `2` top pe aaya. Stack LIFO hota hai — isliye pehla `pop()` top wala element (`2`, yani right operand `b`) deta hai, `8` nahi!",
        hi: "`82-` में पहले `8` और फिर `2` स्टैक पर रखा गया। स्टैक LIFO होता है, इसलिए पहला `pop()` दायाँ ऑपरेंड `2` (`b`) लौटाता है, `8` (`a`) नहीं!"
      },
      hints: {
        en: [
          "Trace the stack for `82-`: after pushing `'8'` and `'2'`, which value sits on the TOP of the stack?",
          "In non-commutative operations (`-`, `/`, `%`, `^`), `a - b` is NOT equal to `b - a`. Which variable should receive the FIRST `stack.pop()`?",
          "Pop the right operand first (`int b = stack.pop();`) and the left operand second (`int a = stack.pop();`), then call `calculate(a, b, ch)`."
        ],
        hinglish: [
          "`82-` ke liye stack trace karo: `'8'` aur `'2'` push karne ke baad stack ke TOP pe kaun hai?",
          "`+` aur `*` mein order se farak nahi padta, par `-` aur `/` mein `a - b != b - a`! Pehla `stack.pop()` kaunsa operand hota hai (left `a` ya right `b`)?",
          "Pehle right operand pop karo (`int b = stack.pop();`), phir left operand (`int a = stack.pop();`), aur phir `calculate(a, b, ch)` chalao."
        ],
        hi: [
          "`82-` के लिए स्टैक ट्रेस करें: `'8'` और `'2'` पुश करने के बाद स्टैक के शीर्ष पर क्या है?",
          "`-` और `/` में क्रम महत्वपूर्ण है (`a - b != b - a`)। पहला `stack.pop()` कौन-सा ऑपरेंड देता है?",
          "पहले `int b = stack.pop();` और फिर `int a = stack.pop();` पॉप करें, उसके बाद `calculate(a, b, ch)` कॉल करें।"
        ]
      }
    },
    visualTraceBuggy: [
      { step: 1, label: "Push '8'", state: "Stack: [8]" },
      { step: 2, label: "Push '2'", state: "Stack: [8, 2]  (Top = 2)" },
      { step: 3, label: "a = pop(), b = pop() (BUG!)", state: "a = 2, b = 8 (reversed!)", isError: true },
      { step: 4, label: "calculate(2, 8, '-')", state: "2 - 8 = -6 (WRONG! Expected 6)", isError: true }
    ],
    visualTraceFixed: [
      { step: 1, label: "Push '8', Push '2'", state: "Stack: [8, 2]  (Top = 2)" },
      { step: 2, label: "b = pop() (Right operand)", state: "b = 2, Stack: [8]" },
      { step: 3, label: "a = pop() (Left operand)", state: "a = 8, Stack: []" },
      { step: 4, label: "calculate(8, 2, '-')", state: "8 - 2 = 6 ✓" }
    ],
    transferTest: {
      question: {
        en: "Transfer Test (Unseen): Using the corrected LIFO stack logic, what is the exact result of the postfix expression `93/2-`?",
        hinglish: "Transfer Test (Naya Sawal): Sahi LIFO stack order se postfix expression `93/2-` ka exact result kya hoga?",
        hi: "Transfer Test (नया प्रश्न): सही LIFO स्टैक क्रम का उपयोग करते हुए, पोस्टफ़िक्स एक्सप्रेशन `93/2-` का सटीक मान क्या होगा?"
      },
      options: {
        en: [
          "1 (because 9 / 3 = 3, then 3 - 2 = 1)",
          "-1.66 (because 3 / 9 = 0, then 2 - 0 = 2)",
          "5",
          "2"
        ],
        hinglish: [
          "1 (kyunki 9 / 3 = 3, phir 3 - 2 = 1)",
          "2 (kyunki 3 / 9 = 0, phir 2 - 0 = 2)",
          "5",
          "-1"
        ],
        hi: [
          "1 (क्योंकि 9 / 3 = 3, फिर 3 - 2 = 1)",
          "2 (क्योंकि 3 / 9 = 0, फिर 2 - 0 = 2)",
          "5",
          "-1"
        ]
      },
      correctIndex: 0,
      explanation: {
        en: "Spot on! Push 9, Push 3 -> `/` pops `b=3, a=9` -> `9/3 = 3`, push `3`. Push `2` -> `-` pops `b=2, a=3` -> `3 - 2 = 1`.",
        hinglish: "Bilkul perfect! Pehle `9/3 = 3` stack pe gaya, phir `2` push hua, aur `-` ne `3 - 2 = 1` nikala!",
        hi: "बिल्कुल सटीक! पहले `9/3 = 3` गणना होकर स्टैक पर जाता है, फिर `2` पुश होता है और `3 - 2 = 1` मिलता है।"
      }
    },
    docSearchQuery: "postfix evaluation stack pop order java a b operator"
  },
  {
    id: "recursion-base",
    title: "Recursion: Unhandled Base Case Overflow",
    category: "Recursion & Call Stack",
    difficulty: "Beginner",
    bugLine: 3,
    expectedConcept: "Use inequality guard `if (n <= 1)` instead of strict equality `if (n == 0)` when step size can skip 0.",
    buggyCode: `static int oddStepSum(int n) {
    // BUG: What happens when n is odd (e.g. n = 5)?
    if (n == 0) {
        return 0;
    }
    return n + oddStepSum(n - 2);
}`,
    preQuiz: {
      question: {
        en: "What happens when you call `oddStepSum(5)` with the base case `if (n == 0)`?",
        hinglish: "Jab aap `oddStepSum(5)` call karoge aur base case `if (n == 0)` hai, toh kya hoga?",
        hi: "जब आप `oddStepSum(5)` को `if (n == 0)` बेस केस के साथ कॉल करेंगे, तो क्या होगा?"
      },
      options: {
        en: [
          "Returns 9",
          "Steps 5 -> 3 -> 1 -> -1 -> -3... skipping 0 and crashing with StackOverflowError",
          "Returns 5",
          "Stops automatically at n = 1"
        ],
        hinglish: [
          "9 return karega",
          "5 -> 3 -> 1 -> -1 -> -3... 0 ko skip karke StackOverflowError crash kar dega",
          "5 return karega",
          "n = 1 pe ruk jayega"
        ],
        hi: [
          "9 लौटाएगा",
          "5 -> 3 -> 1 -> -1 -> -3... यह 0 को पार करके StackOverflowError के साथ क्रैश हो जाएगा",
          "5 लौटाएगा",
          "n = 1 पर अपने आप रुक जाएगा"
        ]
      },
      correctIndex: 1
    },
    misconception: {
      id: "fragile-equality-base-case",
      name: {
        en: "Fragile Equality Base Case (`n == 0` Skipped)",
        hinglish: "Strict Equality Base Case (`n == 0` jump ho jana)",
        hi: "कठोर समानता बेस केस (`n == 0` का छूट जाना)"
      },
      diagnosis: {
        en: "Because `n` decreases by `2` each recursive call, odd inputs (`5 -> 3 -> 1 -> -1`) jump straight over `0`! Base cases must guard boundaries with `<=` (e.g., `if (n <= 0) return 0;`), never fragile `==`.",
        hinglish: "Kyunki har call mein `n` 2 se ghat raha hai, odd number (`5 -> 3 -> 1 -> -1`) seedha `0` ke upar se jump kar jata hai! Base case mein hamesha boundary check (`n <= 0`) lagao, sirf `n == 0` nahi!",
        hi: "चूँकि हर कॉल में `n` 2 से घटता है, विषम संख्या (`5 -> 3 -> 1 -> -1`) सीधे `0` को लांघ जाती है। बेस केस में हमेशा `n <= 0` का उपयोग करें।"
      },
      hints: {
        en: [
          "Trace `oddStepSum(5)`: what is `n` in the 1st, 2nd, 3rd, and 4th recursive call?",
          "Look at `1 - 2 = -1`. Does `n` ever equal `0` on that path?",
          "Change the equality check `if (n == 0)` to an inequality boundary guard `if (n <= 0) return 0;`."
        ],
        hinglish: [
          "`oddStepSum(5)` ko step-by-step likho: 1st, 2nd, 3rd, 4th call mein `n` ki values kya hongi?",
          "`1 - 2 = -1` hota hai! Kya is path pe `n` kabhi `0` ke barabar aata hai?",
          "`if (n == 0)` ko badal ke boundary guard `if (n <= 0) return 0;` likho taaki negative jaate hi ruk jaye."
        ],
        hi: [
          "`oddStepSum(5)` को ट्रेस करें: पहली 4 कॉल में `n` का मान क्या होगा?",
          "`1 - 2 = -1` होता है। क्या इस रास्ते पर `n` कभी `0` के बराबर होता है?",
          "`if (n == 0)` को बदलकर `if (n <= 0) return 0;` लिखें।"
        ]
      }
    },
    visualTraceBuggy: [
      { step: 1, label: "oddStepSum(5)", state: "5 != 0 -> calls oddStepSum(3)" },
      { step: 2, label: "oddStepSum(3)", state: "3 != 0 -> calls oddStepSum(1)" },
      { step: 3, label: "oddStepSum(1)", state: "1 != 0 -> calls oddStepSum(-1) (SKIPPED 0!)", isError: true },
      { step: 4, label: "oddStepSum(-1), (-3)...", state: "Call stack overflows -> StackOverflowError", isError: true }
    ],
    visualTraceFixed: [
      { step: 1, label: "oddStepSum(5)", state: "5 > 0 -> 5 + oddStepSum(3)" },
      { step: 2, label: "oddStepSum(3)", state: "3 > 0 -> 3 + oddStepSum(1)" },
      { step: 3, label: "oddStepSum(1)", state: "1 > 0 -> 1 + oddStepSum(-1)" },
      { step: 4, label: "Base Guard (n <= 0)", state: "-1 <= 0 returns 0 -> total = 5+3+1 = 9 ✓" }
    ],
    transferTest: {
      question: {
        en: "Transfer Test (Unseen): In Merge Sort, `mergeSort(arr, left, right)` splits using `mid = (left + right) / 2` and calls `mergeSort(arr, left, mid)`. Why does `if (left <= right)` crash while `if (left < right)` works?",
        hinglish: "Transfer Test (Naya Sawal): Merge Sort mein `if (left <= right)` likhne par crash kyun hota hai, jabki `if (left < right)` sahi chalta hai?",
        hi: "Transfer Test (नया प्रश्न): Merge Sort में `if (left <= right)` लिखने पर क्रैश क्यों होता है, जबकि `if (left < right)` सही काम करता है?"
      },
      options: {
        en: [
          "When `left == right` (1-element array), `mid` equals `left`, so `mergeSort(arr, left, mid)` keeps calling itself forever!",
          "`left <= right` sorts descending instead of ascending",
          "Java arrays cannot have size 1",
          "`mid` becomes negative"
        ],
        hinglish: [
          "Jab `left == right` (single element) hota hai, toh `mid == left` aata hai aur `mergeSort(arr, left, mid)` khud ko bar-bar call karke StackOverflow kar deta hai!",
          "`left <= right` descending sort karta hai",
          "Java mein size 1 ka array nahi hota",
          "`mid` negative ho jata hai"
        ],
        hi: [
          "जब `left == right` (1 तत्व) होता है, तब `mid == left` आता है और `mergeSort(arr, left, mid)` बार-बार खुद को कॉल करके स्टैक ओवरफ़्लो कर देता है!",
          "`left <= right` अवरोही क्रम में सॉर्ट करता है",
          "Java में साइज 1 का ऐरे नहीं होता",
          "`mid` ऋणात्मक हो जाता है"
        ]
      },
      correctIndex: 0,
      explanation: {
        en: "Exact mastery! Just like `n == 0`, a missing/wrong recursion stopping condition on `left == right` creates an infinite self-call.",
        hinglish: "Ekdam sahi pakda! `left == right` pe rukna zaroori hai, warna single-element pe infinite recursion ho jata hai.",
        hi: "बिल्कुल सही! `left == right` पर बेस केस न रुकने पर अनंत रिकर्शन हो जाता है।"
      }
    },
    docSearchQuery: "java recursion stackoverflow base case merge sort"
  }
];
