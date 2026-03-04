const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Challenge = require("./models/Challenge");

dotenv.config();

const challenges = [
    {
        title: "Hello World in Python",
        description: "Write a simple program that prints exactly 'Hello, World!' to the console.",
        difficulty: "Easy",
        language: "python",
        starterCode: "def greet():\n    # write your code here\n    pass\n\ngreet()",
        xpReward: 10,
        testCases: [
            {
                input: "none",
                expectedOutput: "Hello, World!\n",
                isHidden: false
            }
        ]
    },
    {
        title: "Sum of Two Numbers (JS)",
        description: "Create a function `sum(a, b)` that returns the sum of two numbers. Note: For this execution environment, we will provide the console.logs to test your function.",
        difficulty: "Easy",
        language: "javascript",
        starterCode: "function sum(a, b) {\n    // your code here\n    return 0;\n}\n\n// Do not modify below this line\ntry { console.log(sum(5, 7)); } catch(e) {}",
        xpReward: 15,
        testCases: [
            {
                input: "none",
                expectedOutput: "12\n",
                isHidden: false
            }
        ]
    },
    {
        title: "Even or Odd (Python)",
        description: "Write a function `is_even(n)` that returns True if the number is even, and False otherwise. Print the result.",
        difficulty: "Easy",
        language: "python",
        starterCode: "def is_even(n):\n    # return True or False\n    pass\n\nprint(is_even(4))\nprint(is_even(7))",
        xpReward: 20,
        testCases: [
            {
                input: "none",
                expectedOutput: "True\nFalse\n",
                isHidden: false
            }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        // Optional: clear existing challenges if we want a fresh start
        // await Challenge.deleteMany({});

        await Challenge.insertMany(challenges);
        console.log("Successfully seeded challenges!");
        process.exit();
    } catch (err) {
        console.error("Error seeding DB:", err);
        process.exit(1);
    }
};

seedDB();
