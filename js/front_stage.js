const api_path = "chrissqr";
const token = "uJqFjuQEV9b0AwgUjRJFR2RcZCk2";
const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}`;
let productList;
let shoppingCartList;

//1. 初始化: 取得產品與購物車列表
//取得產品列表
function getProductList() {
    axios
        .get(
            `${url}/products`
        )
        .then(function (response) {
            productList = response.data.products;
            //console.log(productList);
            renderProductList(productList);//
        })
        .catch(function (error) {
            console.log(error.response.message);
        });
}

//不一定是 變數 productList 可能是其他組好的產品陣列，所以定外寫一個 porductArray 參數
function renderProductList(productArray) {
    let str = "" // 組字串給 innerHTML
    let productWrap = document.querySelector(".productWrap"); //DOM
    productArray.forEach(function (item) {
        let numeralOriginPrice = numeral(item.origin_price);
        let numeralPrice = numeral(item.price);
        let originPriceStr = numeralOriginPrice.format("$0,0");
        let priceStr = numeralPrice.format("$0,0");
        // 組字串的時候，要把商品的 id 寫入"加入購物車"按鈕的 data-id 裡面，後續按了按鈕才知道是要加入哪一項商品到購物車內
        let li = `<li class="productCard">
                    <h4 class="productType">新品</h4>
                    <img src= "${item.images}" alt="">
                    <a href="#shoppingCart" class="addCardBtn" data-id=${item.id}>加入購物車</a> 
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT${originPriceStr}</del>
                    <p class="nowPrice">NT${priceStr}</p>
                </li>`;
        str += li;
    });
    productWrap.innerHTML = str;
}
getProductList();

//產品列表篩選功能
let productSelect = document.querySelector(".productSelect");
//console.log(productSelect.value);
productSelect.addEventListener("change", function (e) {
    console.log(e.target.value);
    //宣告一個 filteredProductArray 陣列儲存篩選過後的商品物件
    let filteredProductArray = [];
    //如果 prductList 內容物件的 category 屬性值，和 e.target.value 一樣
    productList.forEach(function (item) {
        if (item.category == e.target.value) {
            // console.log(item.category);
            filteredProductArray.push(item);
            renderProductList(filteredProductArray);
        }
        if ((e.target.value) == "全部") {
            renderProductList(productList);
        }
    })
    //
})



//取得購物車列表
function getCartList() {
    axios
        .get(
            `${url}/carts`
        )
        .then(function (response) {
            renderCartList(response);
        });
}
getCartList();

function renderCartList(response) {
    shoppingCartList = response.data;
    if(shoppingCartList.status == false){
        
    }
    //console.log(shoppingCartList);
    //處理表頭
    let str = `
              <tr>
                  <th width="40%">品項</th>
                  <th width="15%">單價</th>
                  <th width="15%">數量</th>
                  <th width="15%">金額</th>
                  <th width="15%"></th>
              </tr>`;
    let totalPrice = 0; //總金額
    let shoppingCartTable = document.querySelector(".shoppingCart-table"); //DOM

    // 可能受到回傳訊息的影響，伺服器端購物車狀態為 false 的時候，要在客戶端建立一個模型讓狀態處理順利進行
    if(shoppingCartList.status == false){
        shoppingCartList = {
            carts:[],
            finalTotal:0,
            status: true,
            total: 0
        }
    }
    // 狀態處理：購物車沒有東西
    if ((shoppingCartList == undefined) || shoppingCartList.carts.length == 0) {
        let li = `
                 <tr>
                     <td>
                         <div class="cardItem-title">
                             <img src="" alt="">
                             <p>沒有商品</p>
                         </div>
                     </td>
                     <td>NT$0</td>
                     <td>0</td>
                     <td>NT$0</td>
                     <td class="discardBtn">
                         
                     </td>
                 </tr>`;
        str += li;
    }
    // 狀態處理：購物車有東西
    else {
        response.data.carts.forEach(function (item) {
            let numeralPrice = numeral(item.product.price);
            let priceStr = numeralPrice.format("$0,0");
            let subTotalPrice = (item.product.price) * item.quantity;
            let numeralSubTotalPrice = numeral(subTotalPrice);
            let subTotalPriceStr = numeralSubTotalPrice.format("$0,0");
            let cartId = item.id;
            //處理單身：組字串給 innerHTML
            let li = `
                     <tr>
                         <td>
                             <div class="cardItem-title">
                                 <img src="${item.product.images}" alt="">
                                 <p>${item.product.title}</p>
                             </div>
                         </td>
                         <td>NT${priceStr}</td>
                         <td>${item.quantity}</td>
                         <td>NT${subTotalPriceStr}</td>
                         <td class="discardBtn">
                             <a href="#shoppingCart" class="material-icons" cart-id="${cartId}">
                                 clear
                             </a>
                         </td>
                     </tr>`;
            str += li;
            //處理總價
            totalPrice += (item.product.price) * (item.quantity);
        });
    }

    //處理表尾
    let totalPriceStr = numeral(totalPrice).format("$0,0");
    let tableEnd = `
                    <tr>
                        <td>
                            <a href="#shoppingCart" class="discardAllBtn">刪除所有品項</a>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                            <p>總金額</p>
                        </td>
                        <td>NT${totalPriceStr}</td>
                    </tr>`;
    str += tableEnd;
    shoppingCartTable.innerHTML = str;
}



//2. 新增: 把商品加入購物車

//data-id="商品獨有的id"
//class="addCardBtn"

//為商品列表 ul class="productWrap" 加入 click 監聽事件 (監聽整個 productList)
//透過 class="addCardBtn" 來確認點擊到特定按鈕
//將這顆按鈕 data-id 屬性還有 quantity，組合成要 post 出去的資料，格式如下：
//{
// "data": {
//     "productId": "產品 ID (String)",
//     "quantity": 5
//   }
// }

const productWrap = document.querySelector(".productWrap"); //DOM
let productQuantity = 1;
productWrap.addEventListener("click", function (e) {
    if (e.target.getAttribute("class") != "addCardBtn") {
        console.log("沒點到，哈哈");
        return
    }
    //console.log(e.target.getAttribute("data-id"));
    let productId = e.target.getAttribute("data-id");
    //處理產品數量
    //取得伺服器購物車列表
    axios
        .get(
            `${url}/carts`
        )
        .then(function (response) {
            console.log(response.data.carts);
            let latestCartsArray = response.data.carts;
            productQuantity = 1; //預設就是增加一個產品到購物車
            latestCartsArray.forEach((item) => {
                //console.log(item.quantity);
                console.log(item.product.id);
                console.log(productId);
                //但如果購物車裡面有相同 id 的產品，就取得它的 quantity
                if (productId == item.product.id) {
                    console.log(`購物車原本有這項產品，數量為${item.quantity}個`);
                    //然後就加上 1 個，準備後面的步驟把數量傳到伺服器
                    productQuantity = item.quantity + 1;
                    console.log(`等一下購物車數量會變成${productQuantity}個`);
                }
            })

            //productQuantity = quantity + 1;
            let productObj = {
                "data": {
                    "productId": productId,
                    "quantity": productQuantity
                }
            }
            //addCartList(productObj);
            addCartList(productObj);
        });



});

function addCartList(productObj) {
    axios
        .post(`${url}/carts`, productObj)
        .then(function (response) {
            renderCartList(response);
        })
        .catch(function (error) {
            console.log(error.response.message);
        });
}

//3. 刪掉整個購物車清單
let shoppingCartTable = document.querySelector(".shoppingCart-table");
console.log(shoppingCartList);
shoppingCartTable.addEventListener("click", function (e) {
    if (e.target.getAttribute("class") != "discardAllBtn") {
        console.log("沒點到，刪不掉");
        return;
    }
    // if (shoppingCartList.carts.length == 0){
    //     Swal.fire({
    //         title: "購物車目前空空的喔!",
    //         text: " ┌|◎o◎|┘",
    //         icon: "info",
    //         confirmButtonText: "繼續選購"
    //     });
    //     return;
    // }
    if (shoppingCartList.carts.length > 0) {
        console.log(e.target);
        deleteAllCartItems();
    } else {
        Swal.fire({
            title: "購物車目前空空的喔!",
            text: " ┌|◎o◎|┘",
            icon: "info",
            confirmButtonText: "繼續選購"
        });
        return;
    }

})
function deleteAllCartItems() {
    axios
        .delete(
            `${url}/carts`
        )
        .then(function (response) {
            renderCartList(response);
        })
        .catch(function (error) {
            console.log(error.response.message);
        });
}

//4. 刪除指定的訂單項目
shoppingCartTable.addEventListener("click", function (e) {
    if (e.target.getAttribute("class") == "discardBtn") {
        console.log("沒點到，刪不掉2");
        return;
    }
    console.log(e.target);
    cartId = e.target.getAttribute("cart-id");
    deletCartItem(cartId);
});
function deletCartItem(cartId) {
    axios
        .delete(
            `${url}/carts/${cartId}`
        )
        .then(function (response) {
            // console.log(response.data);
            renderCartList(response);
        });
}

//5. 送出訂單
const orderInfoForm = document.querySelector(".orderInfo-form");
orderInfoForm.addEventListener("click", function (e) {
    if (e.target.getAttribute("class") != "orderInfo-btn") {
        return;
    }

    //檢查欄位的布林參數
    let hasValueArray = [false, false, false, false, true];
    let hasValueAll = true;
    let isValid = false

    //抓ＮodList
    let inputNodeList = document.querySelectorAll(".orderInfo-input");
    let dataMessageNodeList = document.querySelectorAll(".orderInfo-message")

    //顯示必填或關掉必填
    inputNodeList.forEach(function (item, index) {
        if (item.value == "") {
            dataMessageNodeList[index].innerHTML = "<span>必填</span>";
            hasValueArray[index] = false;
        } else {
            // 這邊為什麼會報錯？ 在期中試煉的時候不會！
            // dataMessageNodeList[index].innerHTML =`<span>&nbsp</span>`;
            hasValueArray[index] = true;
        }
    });

    //確認每一個欄位都有值
    hasValueArray.forEach(function (item) {
        console.log(item);
        if (item == false) {
            hasValueAll = false;
        }
    })

    //用正規表達式檢查 Email
    isValid = /^(\w+)@([\w.]+)/.test(inputNodeList[2].value);
    if (isValid == false) {
        dataMessageNodeList[2].innerHTML = "<span>必須包含符號＠</span>";
    }
    console.log(`isValid: ${isValid}`);
    //如果每一個欄位都有值，且Email 格式正確
    if ((hasValueAll == true) && isValid == true) {
        let data = {
            "data": {
                "user": {
                    "name": inputNodeList[0].value,
                    "tel": inputNodeList[1].value,
                    "email": inputNodeList[2].value,
                    "address": inputNodeList[3].value,
                    "payment": inputNodeList[4].value
                }
            }
        };
        //檢查購物車有沒有東西
        if ((shoppingCartList.carts == undefined) || (shoppingCartList.carts.length == 0 || undefined)) {
            Swal.fire({
                title: "購物車目前空空的喔!",
                text: " ┌|◎o◎|┘",
                icon: "info",
                confirmButtonText: "繼續選購"
            });
            return;
        }
        postCustomerOrders(data); //訂單要去後台囉！！=========─=≡Σ((( つ•̀ω•́)つ=======>[接] ლ(́◕◞౪◟◕‵ლ)[後台]
    }

})


function postCustomerOrders(data) {
    axios
        .post(
            `${url}/orders`, data
        )
        .then(function (response) {
            console.log(response);
            console.log(response.status);
            if (response.status == 200) {
                Swal.fire({
                    title: "預定成功!",
                    text: "訂單已送出 ｡:.ﾟヽ(*´∀`)ﾉﾟ.:｡",
                    icon: "success",
                    confirmButtonText: "繼續選購"
                });
                getCartList(); // post 出去之後，遠端的購物車已經是空的，所以要把最新狀態拿回來！
                renderOrderInfo();
                productSelect.value = "全部";
                getProductList();
            }

        });
}

function renderOrderInfo() {
    //DOM
    //往外抓一層，重新render 按鈕就會失效？為什麼？
    let orderInfoForm = document.querySelector(".orderInfo-form");
    orderInfoForm.innerHTML = `
    <div class="orderInfo-formGroup">
                <label for="customerName" class="orderInfo-label">姓名</label>
                <div class="orderInfo-inputWrap">
                    <input type="text" class="orderInfo-input" id="customerName" placeholder="請輸入姓名" name="姓名">
                    <p class="orderInfo-message" data-message="姓名"></p>
                </div>
            </div>
            <div class="orderInfo-formGroup">
                <label for="customerPhone" class="orderInfo-label">電話</label>
                <div class="orderInfo-inputWrap">
                    <input type="tel" class="orderInfo-input" id="customerPhone" placeholder="請輸入電話" name="電話">
                    <p class="orderInfo-message" data-message="電話"></p>
                </div>
            </div>
            <div class="orderInfo-formGroup">
                <label for="customerEmail" class="orderInfo-label">Email</label>
                <div class="orderInfo-inputWrap">
                    <input type="email" class="orderInfo-input" id="customerEmail" placeholder="請輸入 Email" name="Email">
                    <p class="orderInfo-message" data-message="Email"></p>
                </div>
            </div>
            <div class="orderInfo-formGroup">
                <label for="customerAddress" class="orderInfo-label">寄送地址</label>
                <div class="orderInfo-inputWrap">
                    <input type="text" class="orderInfo-input" id="customerAddress" placeholder="請輸入寄送地址" name="寄送地址">
                    <p class="orderInfo-message" data-message="寄送地址"></p>
                </div>
            </div>
            <div class="orderInfo-formGroup">
                <label for="tradeWay" class="orderInfo-label">交易方式</label>
                <div class="orderInfo-inputWrap">
                    <select id="tradeWay" class="orderInfo-input" name="交易方式">
                        <option value="ATM" selected>ATM</option>
                        <option value="信用卡">信用卡</option>
                        <option value="超商付款">超商付款</option>
                    </select>
                </div>
            </div>
            <input type="button" value="送出預訂資料" class="orderInfo-btn">
    `;
    console.log(orderInfo);
}