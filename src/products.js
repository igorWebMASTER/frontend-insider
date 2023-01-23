  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const mediaQuerieMin = window.matchMedia("(min-width: 600px)");
const mediaQuerieMax = window.matchMedia("(max-width: 600px)");

function getHeaderElement(){
  const  cartElement = document.querySelector(".cart");   
  const  productList = document.getElementById("product-list");   
  const  backIcon = document.querySelector(".back-icon");   
  cartElement.style.display = "block";
  backIcon.style.display = "block";
  productList.style.display = "none";
}

function backToProductList(){
  const  cartElement = document.querySelector(".cart");   
  const  productList = document.getElementById("product-list");   
  const  backIcon = document.querySelector(".back-icon");   
  cartElement.style.display = "none";
  backIcon.style.display = "none";
  productList.style.display = "grid";
}

function handleMediaQuerieMin(mediaQuerieMin) {
  if (mediaQuerieMin.matches) {
    cartElement.style.display = "flex";
  } 
  
  cartElement.style.display = "none";
}

function handleMediaQuerieMax(mediaQuerieMax) {
    if (mediaQuerieMax.matches) {
     cartElement.style.display = "block !important";
   }
}

mediaQuerieMin.addEventListener('change', handleMediaQuerieMin);
mediaQuerieMax.addEventListener('change', handleMediaQuerieMax);
  
  const BASE_URL = 'https://us-central1-insider-integrations.cloudfunctions.net/cart-api-fullstack-test'
  const cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData'));

  function callEndpoint(url, retries = 5, cart) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(cart),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
          if (response.status === 500 && retries > 0) {
            callEndpoint(url, retries - 1, cart)
              .then(resolve)
              .catch(reject);
          } else if (!response.ok) {
            reject(response);
          } else {
            resolve(response);
          }
        })
        .catch(error => {
          if (retries > 0) {
            callEndpoint(url, retries - 1, cart)
              .then(resolve)
              .catch(reject);
          } else {
            reject(error);
          }
        });
    });
  }

  function addToCart(event) {
    const button = event.target;
    const productCode = button.getAttribute('data-product-code');
    
    const cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData') || '{}')
    
    const cart = {
        codigo: productCode,
        quantidade: 1
    }
     
    callEndpoint(`${BASE_URL}/cart${cartLocalData.token ? `/${cartLocalData.token}` : ''}`, 15, cart )
        .then(response => response.json())
        .then(data => {
            
            if (data.token) {
                localStorage.setItem('@cartLocalData', JSON.stringify(data));
                getCartByToken(data.token)
                if(data.products.length > 0){
                    removeEmptyCartElement()
                }
                alert(`Produto adicionado ao carrinho`)
                return;
            }

            alert('Não foi possivel adicionar produto tente novamente.')
        })
        .catch(_error => {
            alert('Não foi possivel adicionar produto tente novamente.');
        });
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
                    <img src="${imagem}"  class="product-thumb" width="400" alt=${nome}>
                    
                </div>
                <div class="product-info">
                    <h4 class="product-brand">${nome}</h4>
                    <h2 class="price">${currencyFormatter.format(valor)}</h2>
                    <button class="card-btn"  data-product-code="${codigo}">adicionar</button>
                </div>
            </div>
        </div>
      `;
  
      const addItemElement  = productElem.querySelector('.card-btn');
      addItemElement .addEventListener('click', addToCart);
  
      productList.appendChild(productElem);


    });
  }).catch(error => alert(error))
  
  function updateCart(cart) {
    const cartList = document.getElementById('cart-items');
    cartList.innerHTML = '';
    const totalCost = cart.valor_total || 0;
    const totalItens = cart?.products.length;

    if(totalItens === 0) return;    
  
    cartList.innerHTML = `
     <div class="cart-itens-content">
       <img src="https://cdn-icons-png.flaticon.com/512/4543/4543114.png" width="40" alt="icone de sacola" >
       <div>
        Sua cesta tem ${totalItens} ${totalItens > 1 ? 'itens' : 'item'}.
       </span>
       </div>
     </div>

     <div class="total-cart">
       <button type="button">total: ${currencyFormatter.format(totalCost)}</button>
      </div>
   `

    for (const product of cart.products) {
        const { imagem, nome, valor, quantity, codigo } = product;
        const cartProductElement = document.createElement('div');
        cartProductElement.classList.add('cart-product');
        cartProductElement.innerHTML = `
            <img class="product-img" src="${imagem}" alt="${nome}" width="50" height="80" />
            <div class="cart-item-info">
                <span class="product-name">${nome}</span> <br />  
                <span class="product-price">${quantity} x ${currencyFormatter.format(valor)}</span> <br />  
                <button class="remove-button" data-product-code="${codigo}" >remover</button>
           </div>
        `;
        const removeElement  = cartProductElement.querySelector('.remove-button');
        removeElement .addEventListener('click', deleteFromCart);
  
        cartList.appendChild(cartProductElement);
    }
  }
  
  function getCartByToken(token){
    fetch(`${BASE_URL}/cart/${token}`,  {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('@cartLocalData', JSON.stringify(data))
        cart = data;
        updateCart(cart);
        removeEmptyCartElement()
    })    
    .catch(error => {
        console.log(error)
    });
  }
  
  function deleteFromCart(event) {
    const button = event.target;
    const productCode = button.getAttribute('data-product-code');
    const cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData'));
  
    fetch(`${BASE_URL}/cart/${cartLocalData.token}/${productCode}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        cart = data;
        getCartByToken(cartLocalData.token);
    })
    .catch(error => {
        alert('Error:', error);
    });
  }

  function removeEmptyCartElement(){
    const cartLocalData = JSON.parse(localStorage.getItem('@cartLocalData'));
    const emptyCarElement = document.querySelector(".empty-cart");   

    if(cartLocalData.products.length === 0) return  emptyCarElement.style.display = "flex";

    emptyCarElement.style.display = "none";
  }
  
  if(cartLocalData?.token){
    getCartByToken(cartLocalData.token)
  }