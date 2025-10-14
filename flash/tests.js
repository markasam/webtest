
/**
 * Runs a series of tests to validate the postfix-to-infix conversion.
 * It generates random problems, evaluates them, converts them to infix,
 * evaluates the infix string using eval(), and compares the results.
 *
 * @param {number} [numberOfTests=1000] - The number of random expressions to test.
 */
function testInfixConversion(numberOfTests = 1000) {

    /**
     * Converts an infix expression string with Unicode operators to a standard JavaScript expression.
     * @param {string} infix - The infix expression string (e.g., "4 + (6 × 2)")
     * @returns {string} - A JavaScript-evaluable string (e.g., "4 + (6 * 2)")
     */
    function convertInfixToJsExpression(infix) {
        return infix.replace(/×/g, '*').replace(/−/g, '-').replace(/÷/g, '/');
    }

    console.log(`Running ${numberOfTests} tests...`);
    let failures = 0;
    const FLOAT_TOLERANCE = 1e-9; // A small tolerance for comparing floating-point numbers

    for (let i = 0; i < numberOfTests; i++) {
        // 1. Generate a random postfix problem
        const postfixExpr = generateProblem();

        // 2. Evaluate it to get the correct answer (ground truth)
        const expectedAnswer = evaluatePostfix(postfixExpr);

        // 3. Convert the postfix expression to our infix string
        const infixExpr = convertPostfixToInfix(postfixExpr);

        // 4. Convert our infix string to a standard JavaScript expression
        const jsExpr = convertInfixToJsExpression(infixExpr);
        
        let actualAnswer;
        try {
            // 5. Use eval() to calculate the result of the generated JS expression
            actualAnswer = eval(jsExpr);
        } catch (error) {
            console.error("\n--- TEST FAILED: Error during eval() ---");
            console.log(`Test Case #${i + 1}`);
            console.log("  - Postfix:      ", postfixExpr.join(' '));
            console.log("  - Infix:        ", infixExpr);
            console.log("  - JS Expression:", jsExpr);
            console.log("  - Error:        ", error.message);
            failures++;
            continue; // Move to the next test
        }

        // 6. Check if the two evaluations match, allowing for float tolerance.
        if (Math.abs(expectedAnswer - actualAnswer) > FLOAT_TOLERANCE) {
            console.error(`\n--- TEST FAILED: Mismatch found! ---`);
            console.log(`Test Case #${i + 1}`);
            console.log("  - Postfix:         ", postfixExpr.join(' '));
            console.log("  - Infix:           ", infixExpr);
            console.log("  - Expected Result: ", expectedAnswer);
            console.log("  - Actual (eval'd): ", actualAnswer);
            failures++;
        }
    }

    console.log("\n--- Test Summary ---");
    if (failures === 0) {
        console.log(`✅ All ${numberOfTests} tests passed successfully!`);
    } else {
        console.error(`❌ Finished with ${failures} failure(s) out of ${numberOfTests} tests.`);
    }
}
