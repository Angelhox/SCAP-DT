const { ipcRenderer } = require("electron");
ipcRenderer.send("hello");
const productName = document.getElementById("name");
const productPrice = document.getElementById("price");
const productDescription = document.getElementById("description");
const productsList = document.getElementById("products");
let products = [];
let editingStatus = false;
let editProductId = "";
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newProduct = {
    name: productName.value,
    price: productPrice.value,
    description: productDescription.value,
  };
  if (!editingStatus) {
    const result = await ipcRenderer.invoke("createProduct", newProduct);
    console.log(result);
    
  } else {
    console.log("Editing product with electron");
    const result = await ipcRenderer.invoke(
      "updateProduct",
      editProductId,
      newProduct
    );
    editingStatus=false;
    editProductId="";
    console.log(result);
  }
  // Para capturar el valor retornado por la función del
  // proceso
  // principal en app.js, debes utilizar ipcRenderer.invoke
  // en lugar de ipcRenderer.send. ipcRenderer.invoke
  // permite enviar un mensaje y esperar una respuesta
  // del proceso principal.
  getProducts();
  productForm.reset();
  productName.focus();
 
});
function renderProducts(products) {
  productsList.innerHTML = "";
  products.forEach((product) => {
    productsList.innerHTML += `
    <div class="card card-body my-2 ">
    <h4>${product.name}</h4>
    <p>${product.description}</p>
    <h3>${product.price}</h3>
    <p>
    <button onclick="deleteProduct('${product.id}')" class="btn btn-danger">DELETE</button>
    <button onclick="editProduct('${product.id}')" class="btn btn-success">EDIT</button>
    </p>
    </div>
    `;
  });
}
const editProduct = async (id) => {
  const product = await ipcRenderer.invoke("getProductById", id);
  productName.value = product.name;
  productPrice.value = product.price;
  productDescription.value = product.description;
  editingStatus = true;
  editProductId = product.id;
  console.log(product);
};
const deleteProduct = async (id) => {
  const response = confirm("Are you sure you want to delete this product?");
  if (response) {
    console.log("id from app.js: ", id);
    const result = await ipcRenderer.invoke("deleteProduct", id);
    console.log("Resultado app.js", result);
    getProducts();
  }
  return;
};
const getProducts = async () => {
  products = await ipcRenderer.invoke("getProducts");
  console.log(products);
  renderProducts(products);
};
async function init() {
  await getProducts();
}
init();
// getProducts();
