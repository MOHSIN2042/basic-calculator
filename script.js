
const resultDisplay = document.getElementById("result");
const historyDisplay = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let current = "0";
let storedValue = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

const symbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷"
};

function render() {
  resultDisplay.value = current;
}

function clearAll() {
  current = "0";
  storedValue = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;
  historyDisplay.textContent = "";
  render();
}

function inputNumber(number) {
  if (current === "Error" || justCalculated) {
    current = number;
    justCalculated = false;
    historyDisplay.textContent = "";
  } else if (waitingForOperand) {
    current = number;
    waitingForOperand = false;
  } else if (current === "0") {
    current = number;
  } else if (current.length < 15) {
    current += number;
  }

  render();
}

function inputDecimal() {
  if (current === "Error" || justCalculated) {
    current = "0.";
    justCalculated = false;
    historyDisplay.textContent = "";
  } else if (waitingForOperand) {
    current = "0.";
    waitingForOperand = false;
  } else if (!current.includes(".")) {
    current += ".";
  }

  render();
}

function calculate(a, b, op) {
  let value;

  switch (op) {
    case "+":
      value = a + b;
      break;
    case "-":
      value = a - b;
      break;
    case "*":
      value = a * b;
      break;
    case "/":
      if (b === 0) return null;
      value = a / b;
      break;
    default:
      return b;
  }

  if (!Number.isFinite(value)) return null;

  // Reduce floating-point precision errors.
  return Number.parseFloat(value.toPrecision(12));
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const inputValue = Number(current);

  if (operator && !waitingForOperand) {
    const value = calculate(
      storedValue,
      inputValue,
      operator
    );

    if (value === null) {
      current = "Error";
      storedValue = null;
      operator = null;
      historyDisplay.textContent = "Cannot divide by zero";
      render();
      return;
    }

    current = String(value);
    storedValue = value;
  } else {
    storedValue = inputValue;
  }

  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;

  historyDisplay.textContent =
    `${storedValue} ${symbols[operator]}`;

  render();
}

function calculateResult() {
  if (
    current === "Error" ||
    operator === null ||
    waitingForOperand
  ) {
    return;
  }

  const first = storedValue;
  const second = Number(current);
  const op = operator;
  const value = calculate(first, second, op);

  historyDisplay.textContent =
    `${first} ${symbols[op]} ${second} =`;

  if (value === null) {
    current = "Error";
    historyDisplay.textContent = "Cannot divide by zero";
  } else {
    current = String(value);
  }

  storedValue = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = true;

  render();
}

function deleteLast() {
  if (current === "Error" || justCalculated) {
    current = "0";
    justCalculated = false;
  } else if (!waitingForOperand) {
    current = current.length > 1
      ? current.slice(0, -1)
      : "0";

    if (current === "-") current = "0";
  }

  render();
}

function changeSign() {
  if (current === "Error") return;

  if (Number(current) !== 0) {
    current = String(-Number(current));
  }

  justCalculated = false;
  render();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
    return;
  }

  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearAll();
      break;

    case "clear-entry":
      current = "0";
      waitingForOperand = false;
      justCalculated = false;
      render();
      break;

    case "delete":
      deleteLast();
      break;

    case "decimal":
      inputDecimal();
      break;

    case "sign":
      changeSign();
      break;

    case "equals":
      calculateResult();
      break;
  }
});

// Support keyboard input as well.
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  }
});

render();
