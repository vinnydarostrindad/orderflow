const registerEmployeeForm = document.forms[0];
const roleSelect = document.querySelector("#role");
const advanceBtn = document.querySelector("#advanceBtn");
const nameInput = document.querySelector("#name");
const warn = document.querySelector(".input-box__warn");
const skipBtn = document.querySelector("#skipBtn");
const employeesTableContainer = document.querySelector("#employeesTable");
const snackbar = document.querySelector(".snackbar");
const modalBg = document.querySelector(".modal-background");
const modal = document.querySelector(".modal");
const modalCancelBtn = document.querySelector("#cancelBtn");
const modalContinueBtn = document.querySelector("#continueBtn");
const roleBox = document.querySelector("#roleBox");

const params = new URLSearchParams(document.location.search);
const businessId = params.get("b");

let employees = [];
let tableExists = false;
let snackbarTimeoutId;

const rolesExplanation = {
  waiter:
    "O garçom terá acesso ao cardápio para registrar os pedidos dos clientes. Antes de iniciar o pedido, ele deve informar o número da mesa. Ele também pode acompanhar o andamento de cada pedido, se está sendo preparado, pronto para entrega ou já foi entregue, além de visualizar o tempo médio de preparo.",
  manager:
    "O gerente tem acesso total ao sistema. Ele pode cadastrar e editar produtos do cardápio, adicionar ou remover funcionários, visualizar estatísticas e relatórios de pedidos, configurar o estabelecimento e acompanhar o funcionamento geral da operação.",
  cook: "O cozinheiro visualiza apenas os pedidos que precisam ser preparados. Ele pode mudar o status de um pedido para 'em preparo', 'pronto' ou deixar observações internas. Ele não pode alterar pedidos ou acessar outras informações do sistema.",
  cashier:
    "O caixa é responsável por finalizar os pedidos. Ele pode visualizar os pedidos prontos para pagamento, registrar o pagamento, emitir comprovantes e acompanhar o histórico de transações. Ele também pode corrigir pedidos com autorização do gerente, caso necessário.",
};

skipBtn.addEventListener("click", handleSkip);
roleSelect.addEventListener("change", updateRoleExplanation);
registerEmployeeForm.addEventListener("submit", addEmployee);
advanceBtn.addEventListener("click", postEmployees);

function saveEmployeesDraft() {
  if (employees.length > 0) {
    sessionStorage.setItem("employeesDraft", JSON.stringify(employees));
  } else {
    sessionStorage.removeItem("employeesDraft");
  }
}

function showSnackBar(type, html) {
  if (snackbarTimeoutId) clearTimeout(snackbarTimeoutId);

  snackbar.innerHTML = html;
  snackbar.classList.remove("snackbar--hidden");
  snackbar.classList.add(`snackbar--${type}`);
  snackbar.setAttribute("aria-hidden", "false");

  snackbarTimeoutId = setTimeout(() => {
    snackbar.classList.add("snackbar--hidden");
    snackbar.addEventListener(
      "transitionend",
      () => {
        snackbar.classList.remove(`snackbar--${type}`);
        snackbar.setAttribute("aria-hidden", "true");
      },
      { once: true },
    );
  }, 5000);
}

function handleSkip(e) {
  e.preventDefault();

  if (employees.length === 0) {
    redirectToNextPage();
    return;
  }

  document.documentElement.style.overflow = "hidden";
  modalBg.classList.remove("modal-background--hidden");
  modal.classList.remove("modal--hidden");

  modalCancelBtn.addEventListener(
    "click",
    () => {
      modalBg.classList.add("modal-background--hidden");
      modal.classList.add("modal--hidden");
      document.documentElement.style.overflow = "";
    },
    { once: true },
  );

  modalContinueBtn.addEventListener(
    "click",
    () => {
      sessionStorage.removeItem("employeesDraft");
      redirectToNextPage();
    },
    { once: true },
  );
}

function redirectToNextPage() {
  window.location.href = `http://localhost:5500/src/main/pages/create_menu/index.html?b=${businessId}`;
}

function updateRoleExplanation(e) {
  const roleValue = e.target.value;
  roleBox.textContent = rolesExplanation[roleValue];
}

function removeEmployee(e) {
  const btn = e.target.closest(".remove-button");
  if (!btn) return;

  const name = btn.dataset.name;
  const role = btn.dataset.role;

  employees = employees.filter(
    (employee) => !(employee.name === name && employee.role === role),
  );

  btn.closest("tr").remove();
}

function createTableIfNeeded() {
  if (tableExists) return;

  employeesTableContainer.innerHTML = `
    <table>
      <caption>
        Funcionários adicionados:
      </caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Cargo</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    </table>
  `;

  tableExists = true;

  document.querySelector("tbody").addEventListener("click", removeEmployee);
}

function renderTableRow({ name, role }) {
  const tableBody = document.querySelector("tbody");
  const roles = {
    manager: "Gerente",
    cook: "Cozinheiro(a)",
    waiter: "Garçom/Garçonete",
    cashier: "Caixa",
  };

  tableBody.innerHTML += `
    <tr>
      <td>${name}</td>
      <td>
        <div>
          ${roles[role]}
          <button class="remove-button" data-name="${name}" data-role="${role}" aria-label="Remover ${name}">
          <img src="./img/remove-icon.svg" alt="Remover">
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function addEmployee(e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const role = roleSelect.value.trim();

  const alreadyExists = employees.some(
    (emp) => emp.name.toLowerCase() === name.toLowerCase() && emp.role === role,
  );

  if (alreadyExists) {
    nameInput.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
    nameInput.value = "";
    nameInput.focus();
    warn.textContent = "Nome já adicionado!";

    const clearWarning = () => {
      warn.textContent = "";
      nameInput.style.backgroundColor = "";
      nameInput.removeEventListener("input", clearWarning);
      nameInput.removeEventListener("blur", clearWarning);
    };

    nameInput.addEventListener("input", clearWarning);
    nameInput.addEventListener("blur", clearWarning);

    return;
  }

  employees.push({ name, role });

  createTableIfNeeded();
  renderTableRow({ name, role });

  nameInput.value = "";
  nameInput.focus({ preventScroll: true });
}

async function postEmployees(e) {
  const btn = e.target;
  btn.disabled = true;
  btn.innerHTML = "avançando";
  btn.classList.add("header-container__button--loading");

  if (employees.length === 0) {
    showSnackBar(
      "warn",
      "<p>Adicione ao menos um funcionário para avançar.</p>",
    );

    btn.disabled = false;
    btn.textContent = "avançar";
    btn.classList.remove("header-container__button--loading");

    return;
  }

  try {
    for (let { name, role } of employees) {
      const response = await fetch(
        `http://localhost:3000/api/v1/business/${businessId}/employee`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name,
            role,
            password: "funcionario",
          }),
        },
      );
      const responseBody = await response.json();
      console.log(responseBody);
    }

    sessionStorage.removeItem("employeesDraft");
    redirectToNextPage();
  } catch (error) {
    console.error(error);
    showSnackBar(
      "error",
      "<p>Erro ao adicionar funcionários. <br /> Tente novamente.</p>",
    );
    btn.disabled = false;
    btn.textContent = "avançar";
    btn.classList.remove("header-container__button--loading");
  }
}

window.addEventListener("beforeunload", saveEmployeesDraft);

const employeesDraft = JSON.parse(sessionStorage.getItem("employeesDraft"));
if (employeesDraft) {
  employees = employeesDraft;
  createTableIfNeeded();
  employeesDraft.forEach(renderTableRow);
}
