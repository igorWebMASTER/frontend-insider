
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

