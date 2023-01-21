const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const cartResponse = {
    token: "c8219186-d024-450a-9c88-3bcb064a1069",
    products: [
        {
            valor: 140,
            nome: "Tech t-shirt Gola V",
            codigo: "tech-t-shirt-gola-v",
            quantity: 1,
            imagem: "https://cdn.shopify.com/s/files/1/0526/4123/5093/products/4_5_400x.jpg?v=1659463010"
        }
    ],
    valor_total: 140,
    itens_total: 1
  }

let cart = {};

const BASE_URL = 'https://us-central1-insider-integrations.cloudfunctions.net/cart-api-fullstack-test'

let cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData'))

function addToCart(event) {
    const button = event.target;
    const productCode = button.getAttribute('data-product-code');
    cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData') || '{}')
    let cart = {};
    if (cart[productCode]) {
        cart.codigo[productCode].quantity++;
    } else{
        cart = {
            "codigo": productCode,
            "quantidade": 1
        }
        fetch(`https://us-central1-insider-integrations.cloudfunctions.net/cart-api-fullstack-test/cart/${cartLocalData?.token}`, {
                method: 'POST',
                body: JSON.stringify(cart),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    localStorage.setItem('@cartLocalData', JSON.stringify(data));
                    addCartItemByToken(data.token)
                }
            })
            .catch(error => {
                console.log('Error:', error);
            });
    }
}

fetch(`${BASE_URL}/products`)
  .then(response => response.json())
  .then(data => {
    data.forEach(({ imagem, nome, valor, codigo }) => {
      const productList = document.getElementById('product-list');
      const productElem = document.createElement('div');
      productElem.classList.add('product');
      productElem.innerHTML = `
        <div class="product-list">
            <div class="product-card">
                <div class="product-image">
                    <img src="${imagem}" class="product-thumb" alt="logo">
                    <button class="card-btn"  data-product-code="${codigo}">adicionar</button>
                </div>
                <div class="product-info">
                    <h2 class="product-brand">${nome}</h2>
                    <p class="product-short-des">a short line about the cloth..</p>
                    <span class="price">$${valor}</span><span class="actual-price">$40</span>
                </div>
            </div>
        </div>
      `;

      const addItemElement  = productElem.querySelector('.card-btn');
      addItemElement .addEventListener('click', addToCart);

      productList.appendChild(productElem);
    });
}).catch(error => console.log(error))
  
function updateCart(cart) {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = '';
    let totalCost = 0;
    let totalItens = cart.products.length;

    cartList.innerHTML = `
        <h3>Sua cesta tem ${totalItens} item</h3>
    `
    for (const product of cart.products) {
        const { imagem, nome, valor, quantity, codigo } = product;
        totalCost += valor * quantity;
        const cartProductElement = document.createElement('div');
        cartProductElement.classList.add('cart-product');
        cartProductElement.innerHTML = `
            <img class="product-img" src="${imagem}" width="50" height="80" />
            <span class="product-name">${nome}</span> <br />   <br /> 
            <span class="product-price">${quantity} x ${currencyFormatter.format(valor)}</span>
            <button class="remove-button" data-product-code="${codigo}" >remover</button>
        `;
        const removeElement  = cartProductElement.querySelector('.remove-button');
        removeElement .addEventListener('click', deleteFromCart);

        cartList.appendChild(cartProductElement);
    }
    // Update the total
    const total = document.getElementById('total');
    total.innerHTML = `Total: $${totalCost || 0}`;
}

const addCartItemByToken = async (token) => {
    fetch(`${BASE_URL}/cart/${token}`,  {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update the cart object
        cart = data;
        // Update the cart on the front-end
        updateCart(cart);
    })    
    .catch(error => {
        console.log('Error:', error);
    });
}

function deleteFromCart(event) {
    const button = event.target;
    const productCode = button.getAttribute('data-product-code');
  
    fetch(`https://us-central1-insider-integrations.cloudfunctions.net/cart-api-fullstack-test/cart/${cartLocalData.token}/${productCode}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        cart = data;
        updateCart(cart);
    })
    .catch(error => {
        console.log('Error:', error);
    });
  }

if(cartLocalData.token){
    addCartItemByToken(cartLocalData.token)
}

