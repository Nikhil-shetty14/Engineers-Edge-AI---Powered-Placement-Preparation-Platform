import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';

export const curatedAptitudeBanks: Record<string, GenerateQuizOutput> = {
  'Logical Reasoning': {
    questions: [
      {
        questionText: 'In a code language, if SYSTEM is coded as SYSMET, how is FRACTION coded?',
        options: ['CARFNOIT', 'NOITCARF', 'FRACNOIT', 'CRAFFOIT'],
        correctAnswer: 'CARFNOIT',
        explanation: 'The word is split into two equal halves of 4 letters each (FRAC and TION). The first half is reversed to CARF, and the second half is reversed to NOIT, producing CARFNOIT.',
      },
      {
        questionText: 'Pointing to a photograph, a woman says: "He is the son of the only daughter of the father of my brother." How is the boy related to the woman?',
        options: ['Son', 'Nephew', 'Brother', 'Cousin'],
        correctAnswer: 'Son',
        explanation: 'The father of her brother is her own father. The only daughter of her father is the woman herself. Hence, he is her son.',
      },
      {
        questionText: 'Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?',
        options: ['7', '10', '12', '13'],
        correctAnswer: '10',
        explanation: 'This is an alternating addition and subtraction series: +3, -2, +3, -2, +3, -2. 12 - 2 = 10.',
      },
      {
        questionText: 'Statements: All mangoes are golden. No golden things are cheap. Conclusions: I. All mangoes are costly. II. Golden mangoes are not cheap.',
        options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
        correctAnswer: 'Both I and II follow',
        explanation: 'Since all mangoes are golden and no golden things are cheap, mangoes cannot be cheap, meaning both conclusions are logically valid.',
      },
      {
        questionText: 'A person walks 5 km East, turns right and walks 4 km, then turns left and walks 3 km. In which direction is the person facing?',
        options: ['North', 'East', 'South', 'West'],
        correctAnswer: 'East',
        explanation: 'After walking East, turning right faces South. Then turning left faces East again.',
      },
    ],
  },
  'Numerical & Quantitative Ability': {
    questions: [
      {
        questionText: 'A can complete a project in 12 days and B in 15 days. If they work together, in how many days will the project be finished?',
        options: ['6.67 days', '7.5 days', '8 days', '9 days'],
        correctAnswer: '6.67 days',
        explanation: 'Combined 1-day rate = (1/12) + (1/15) = (5+4)/60 = 9/60. Total days = 60/9 = 6.67 days.',
      },
      {
        questionText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        options: ['65 sec', '89 sec', '100 sec', '72 sec'],
        correctAnswer: '89 sec',
        explanation: 'Speed = 240/24 = 10 m/s. Total distance for platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
      },
      {
        questionText: 'Two cards are drawn at random from a pack of 52 cards. What is the probability that both are kings?',
        options: ['1/221', '1/169', '1/26', '2/52'],
        correctAnswer: '1/221',
        explanation: 'Probability = (4/52) * (3/51) = (1/13) * (1/17) = 1/221.',
      },
      {
        questionText: 'The cost price of 20 articles is equal to the selling price of 16 articles. The gain percentage is:',
        options: ['20%', '25%', '30%', '33.3%'],
        correctAnswer: '25%',
        explanation: 'Let CP of 1 article = $1. CP of 20 = $20 = SP of 16. SP of 1 = 20/16 = $1.25. Profit = 0.25 / 1 = 25%.',
      },
      {
        questionText: 'What is the compound interest on $10,000 at 10% per annum for 2 years, compounded annually?',
        options: ['$2,000', '$2,100', '$2,200', '$2,050'],
        correctAnswer: '$2,100',
        explanation: 'Amount = 10000 * (1.1)^2 = $12,100. CI = 12100 - 10000 = $2,100.',
      },
    ],
  },
  'Verbal Ability & Comprehension': {
    questions: [
      {
        questionText: 'Select the synonym of "METICULOUS":',
        options: ['Careless', 'Painstaking & Thorough', 'Hasty', 'Superficial'],
        correctAnswer: 'Painstaking & Thorough',
        explanation: 'Meticulous denotes showing great attention to detail; very careful and precise.',
      },
      {
        questionText: 'Select the antonym of "EPHEMERAL":',
        options: ['Transient', 'Fleeting', 'Permanent & Enduring', 'Brief'],
        correctAnswer: 'Permanent & Enduring',
        explanation: 'Ephemeral means lasting for a very short time; its antonym is permanent or enduring.',
      },
      {
        questionText: 'Identify the grammatically correct sentence:',
        options: [
          'Neither the manager nor the engineers was ready.',
          'Neither the manager nor the engineers were ready.',
          'Neither the manager or the engineers was ready.',
          'Neither the manager nor the engineers is ready.',
        ],
        correctAnswer: 'Neither the manager nor the engineers were ready.',
        explanation: 'When using "neither...nor", the verb agrees with the subject closest to it ("the engineers" is plural -> "were ready").',
      },
      {
        questionText: 'Fill in the blank: The new architecture is expected to _____ server latency significantly.',
        options: ['abate', 'mitigate', 'alleviate', 'ameliorate'],
        correctAnswer: 'mitigate',
        explanation: 'In engineering contexts, risks, latency, and vulnerabilities are standardly "mitigated".',
      },
      {
        questionText: 'Analogy: PROLOGUE : PLAY ::',
        options: ['Intermission : Film', 'Preface : Book', 'Epilogue : Novel', 'Overture : Recital'],
        correctAnswer: 'Preface : Book',
        explanation: 'A prologue is an introduction to a play, just as a preface is an introduction to a book.',
      },
    ],
  },
  'Data Interpretation & Analytics': {
    questions: [
      {
        questionText: 'In a company of 500 employees, 40% are in Engineering, 25% in Product, and the remaining in Operations. How many employees are in Operations?',
        options: ['150', '175', '200', '125'],
        correctAnswer: '175',
        explanation: 'Engineering + Product = 40% + 25% = 65%. Operations = 100% - 65% = 35%. 35% of 500 = 175.',
      },
      {
        questionText: 'If quarterly revenue increased from $1.2M in Q1 to $1.8M in Q2, what was the percentage growth?',
        options: ['33.3%', '50.0%', '60.0%', '66.7%'],
        correctAnswer: '50.0%',
        explanation: 'Growth = ((1.8 - 1.2) / 1.2) * 100 = (0.6 / 1.2) * 100 = 50.0%.',
      },
      {
        questionText: 'A database query latency dropped from 120ms to 30ms following cache indexing. What is the ratio of reduction?',
        options: ['1:4', '3:4', '4:1', '2:3'],
        correctAnswer: '3:4',
        explanation: 'Reduction = 120ms - 30ms = 90ms. Ratio of reduction to original = 90/120 = 3/4 (75% drop).',
      },
      {
        questionText: 'If 3 microservices A, B, and C process 40%, 35%, and 25% of requests respectively, and error rates are 1%, 2%, and 4%, what is the weighted error rate?',
        options: ['2.1%', '2.3%', '1.9%', '2.5%'],
        correctAnswer: '2.1%',
        explanation: 'Weighted sum = (0.40 * 1) + (0.35 * 2) + (0.25 * 4) = 0.40 + 0.70 + 1.00 = 2.1%.',
      },
      {
        questionText: 'In a campus recruitment drive of 200 candidates, 60 cleared Coding, 40 cleared Aptitude, and 20 cleared both. How many cleared at least one round?',
        options: ['80', '100', '120', '60'],
        correctAnswer: '80',
        explanation: 'Using union formula: |A U B| = |A| + |B| - |A ∩ B| = 60 + 40 - 20 = 80.',
      },
    ],
  },
};

export const curatedTechQuizBanks: Record<string, GenerateQuizOutput> = {
  'Data Structures & Algorithms': {
    questions: [
      {
        questionText: 'What is the average time complexity of lookups in a balanced Binary Search Tree (AVL / Red-Black)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 'O(log n)',
        explanation: 'Balanced BSTs maintain height h = O(log n), making search, insertion, and deletion O(log n) worst and average case.',
      },
      {
        questionText: 'Which algorithm is typically used to detect a cycle in a linked list with O(1) auxiliary space?',
        options: ['Dijkstra’s Algorithm', 'Floyd’s Cycle-Finding (Tortoise and Hare)', 'Tarjan’s Algorithm', 'Kruskal’s Algorithm'],
        correctAnswer: 'Floyd’s Cycle-Finding (Tortoise and Hare)',
        explanation: 'Floyd’s algorithm uses slow and fast pointers moving at 1x and 2x speeds, requiring only O(1) space.',
      },
      {
        questionText: 'What data structure is utilized in breadth-first search (BFS) graph traversal?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Deque'],
        correctAnswer: 'Queue',
        explanation: 'BFS explores nodes level by level using a FIFO Queue.',
      },
      {
        questionText: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: 'O(n²)',
        explanation: 'When the chosen pivot is always the smallest or largest element, partitioning produces unbalanced sub-arrays yielding O(n²).',
      },
      {
        questionText: 'Which data structure offers amortized O(1) insertion, deletion, and search by key?',
        options: ['Hash Table', 'B-Tree', 'Segment Tree', 'Heap'],
        correctAnswer: 'Hash Table',
        explanation: 'A Hash Table maps keys to buckets via a hash function, providing O(1) expected time for fundamental operations.',
      },
    ],
  },
};
