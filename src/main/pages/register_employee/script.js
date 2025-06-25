const roleSelect = document.querySelector("#role");
const advanceButton = document.querySelector("#advance");
let params = new URLSearchParams(document.location.search);
let businessId = params.get("businessId"); // is the string "Jonathan"

const rolesExplication = {
  waiter:
    "O garçom terá acesso ao cardápio para registrar os pedidos dos clientes. Antes de iniciar o pedido, ele deve informar o número da mesa. Ele também pode acompanhar o andamento de cada pedido, se está sendo preparado, pronto para entrega ou já foi entregue, além de visualizar o tempo médio de preparo.",
  manager:
    "O gerente tem acesso total ao sistema. Ele pode cadastrar e editar produtos do cardápio, adicionar ou remover funcionários, visualizar estatísticas e relatórios de pedidos, configurar o estabelecimento e acompanhar o funcionamento geral da operação.",
  cook: "O cozinheiro visualiza apenas os pedidos que precisam ser preparados. Ele pode mudar o status de um pedido para 'em preparo', 'pronto' ou deixar observações internas. Ele não pode alterar pedidos ou acessar outras informações do sistema.",
  cashier:
    "O caixa é responsável por finalizar os pedidos. Ele pode visualizar os pedidos prontos para pagamento, registrar o pagamento, emitir comprovantes e acompanhar o histórico de transações. Ele também pode corrigir pedidos com autorização do gerente, caso necessário.",
};

roleSelect.onchange = showRoleExplication;

let tableExists = false;
let employees = [];
document.forms[0].onsubmit = async (e) => {
  e.preventDefault();

  console.log("Envia");

  const name = document.querySelector("#name").value;
  const role = roleSelect.value;

  employees.push([name, role]);

  if (!tableExists) {
    tableExists = true;
    createTable();
  }

  addToTable(name, role);
};

function showRoleExplication(e) {
  const roleBox = document.querySelector(".roleBox");

  const roleValue = e.target.value;

  for (let role in rolesExplication) {
    if (role === roleValue) {
      roleBox.innerHTML = rolesExplication[role];
    }
  }
}

function createTable() {
  const employeesTableContainer = document.querySelector("#employeesTable");

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
}

function addToTable(name, role) {
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
      <td>${roles[role]}</td>
    </tr>
  `;
}

advanceButton.onclick = async () => {
  if (employees.length === 0) {
    alert("Adicione algum funcionário para prosseguir.");
    return;
  }

  employees.forEach(async (employee) => {
    const name = employee[0];
    const role = employee[1];
    console.log(employee, role);

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

    window.location.href = `http://localhost:5500/src/main/pages/create_menu/index.html?businessId=${businessId}`;
  });
};
