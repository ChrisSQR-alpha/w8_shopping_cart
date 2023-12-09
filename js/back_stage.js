const api_path = "chrissqr";
const token = "uJqFjuQEV9b0AwgUjRJFR2RcZCk2";
const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}`;


//1. 向伺服器要求訂單資料並且渲染畫面
getOrderList();

function getOrderList() {
    axios
        .get(
            `${url}/orders`,
            {
                headers: {
                    "Authorization": token
                }
            }
        )
        .then(function (response) {
            console.log(response.data.orders);
            renderOrderList(response);
            renderChartEachClass(calculateDataEachClass(response));
            renderChartEachProduct(calculateDataEachProduct(response));
        });
}
// 組合每一筆訂單的購買項目及數量列表
function getProductSet(productArray) {

    let productSet = "<ol>";
    productArray.forEach(function (item) {
        productSet += `<li>${item.title} x ${item.quantity}</li>`
    })
    productSet += "</ol>";
    return productSet;
}
// 將毫秒轉換為日期
function convertDate(ms) {
    const timestamp = ms; // 毫秒數
    const date = new Date(timestamp * 1000); // 將毫秒數轉換為秒數並創建 Date 物件
    const year = date.getFullYear(); // 取得年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 取得月份，並確保兩位數格式
    const day = String(date.getDate()).padStart(2, '0'); // 取得日期，並確保兩位數格式
    const formattedDate = `${year}/${month}/${day}`; // 構建 YYYY/MM/DD 格式的日期字串
    return formattedDate; // 輸出格式化後的日期
}
// 渲染訂單列表
function renderOrderList(response) {
    let orderList = response.data.orders;
    let tabeleHeadStr = `<thead>
                                <tr>
                                    <th>訂單編號</th>
                                    <th>聯絡人</th>
                                    <th>聯絡地址</th>
                                    <th>電子郵件</th>
                                    <th>訂單品項</th>
                                    <th>訂單日期</th>
                                    <th>訂單狀態</th>
                                    <th>操作</th>
                                </tr>
                            </thead>`;
    let trStr = ``;
    orderList.forEach(function (item) {
        let productArray = item.products;
        let productStr = getProductSet(productArray);
        let ms = item.createdAt;
        let date = convertDate(ms);
        let orderStatus = "未處理";
        if (item.paid == true) {
            orderStatus = "已處理";
        }
        trStr += `<tr>
                              <td>${item.id}</td>
                              <td>
                                  <p>${item.user.name}</p>
                                  <p>${item.user.tel}</p>
                              </td>
                              <td>${item.user.address}</td>
                              <td>${item.user.email}</td>
                              <td>
                                  ${productStr}
                              </td>
                              <td>${date}</td>
                              <td>
                                  <a href="#${item.id}" class="orderStatus" id="${item.id}" data-status="${item.paid}" 
                                  style="color:#0067CE;">${orderStatus}</a>
                              </td>
                              <td>
                                  <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${item.id}">
                              </td>
                          </tr>`;
    });
    let str = tabeleHeadStr + trStr;
    let orderPageTable = document.querySelector(".orderPage-table");
    orderPageTable.innerHTML = str;
}
// 回傳組好的分類資料陣列
function calculateDataEachClass(response) {
    let classObject = {};
    let allOrdersArray = response.data.orders;
    // console.log(allOrdersArray);
    allOrdersArray.forEach(function (eachOrder) {
        // console.log(eachOrder.products);
        let eachOrderProductsArray = eachOrder.products;
        eachOrderProductsArray.forEach(function (eachProduct) {
            // console.log(eachProduct.category);
            let targetProductCategory = eachProduct.category;
            if (classObject[targetProductCategory] == undefined) {
                classObject[targetProductCategory] = 1;
            } else {
                classObject[targetProductCategory] += 1;
            }
        })
    })
    // console.log(classObject);
    let dataEachClassArray = Object.entries(classObject);
    // console.log(dataEachClassArray);
    return dataEachClassArray;
}
// 渲染 Lv1 圖表
function renderChartEachClass(dataEachClassArray) {
    // C3.js
    let chartEachClass = c3.generate({
        bindto: '#chartEachClass', // HTML 元素綁定
        data: {
            type: "pie",
            columns: dataEachClassArray,

        },
        color: {
            pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
        }
    });
}
// 回傳組好的各品項資料
function calculateDataEachProduct(response) {
    console.log(response.data.orders);
    let productObject = {};
    let allOrdersArray = response.data.orders;
    allOrdersArray.forEach(function (eachOrder) {
        // console.log(eachOrder.products);
        let eachOrderProductsArray = eachOrder.products;
        eachOrderProductsArray.forEach(function (eachProduct) {
            // console.log(eachProduct.title);
            let eachProductTitle = eachProduct.title;
            if (productObject[eachProductTitle] == undefined) {
                productObject[eachProductTitle] = 1;
            } else {
                productObject[eachProductTitle] += 1;
            }
        })
    })
    let dataEachProductArray = Object.entries(productObject);
    dataEachProductArray.sort((anElement, anotherElement) => anotherElement[1] - anElement[1]);
    console.log(dataEachProductArray);
    let dataInductionArray = [];
    let others = 0
    dataEachProductArray.forEach(function (item, index) {
        if (index <= 2) {
            dataInductionArray.push(item);
        } else {
            others += item[1];
        }
    })
    dataInductionArray[3] = ['其他', others];
    console.log(dataInductionArray);
    return dataInductionArray;
}
// 渲染 Lv2 圖表 
function renderChartEachProduct(dataInductionArray) {
    // C3.js
    let chartEachProduct = c3.generate({
        bindto: '#chartEachProduct', // HTML 元素綁定
        data: {
            type: "pie",
            columns: dataInductionArray,
        },
        color: {
            pattern:["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]
        }
    });
}

//3. 修改訂單狀態
// DOM orderStatus
// 組合目標物件，paid 的 vlaue 型別是 bool
// {
//     "data": {
//       "id": "訂單 ID (String)",
//       "paid": true
//     }
//   }
// DOM orderPageTable 
// 監聽 table 的點擊事件
// 如果點擊位置，其 class="orderStatus"，就把 dataId dataStatus 傳給 putOrderStatus
// 進 putOrderStatus 之後，先處理 paid 值的問題
// 接著戳 API
let orderPageTable = document.querySelector(".orderPage-table");
orderPageTable.addEventListener("click", function (e) {
    const nodeClass = e.target.getAttribute("class");
    const dataId = e.target.getAttribute("id");
    let dataStatus = e.target.getAttribute("data-status");
    if (nodeClass != "orderStatus") {
        return;
    }
    console.log(dataStatus);
    putOrderStatus(dataId, dataStatus);
});
function putOrderStatus(dataId, dataStatus) {
    // dataStatus 進來的時候型別是 string
    // 所以指定一個代理 bool 參數 boolChange
    let boolChange = false;
    if (dataStatus === "false") {
        boolChange = true;
    }
    if (dataStatus === "true") {
        boolChange = false;
    }
    axios.
        put(`${url}/orders`,
            {
                "data": {
                    "id": dataId,
                    "paid": boolChange
                }
            },
            {
                headers: {
                    Authorization: token
                }
            }).
        then(function (response) {
            renderOrderList(response);
        });
}

//4. 刪除單筆定單資料並渲染畫面
// DOM orderTableWrap
// 監聽表單的點擊事件
// 如果點擊的位置，其 class="delSingleOrder-Btn"，就用getAttribute()，取出data-id
// 戳 API
// 重新渲染訂單畫面
// 重新計算圖表要的數據
// 重新渲染圖表
let orderTableWrap = document.querySelector(".orderTableWrap");
orderTableWrap.addEventListener("click", function (e) {
    const nodeClass = e.target.getAttribute("class");
    const dataId = e.target.getAttribute("data-id");
    if (nodeClass != "delSingleOrder-Btn") {
        return;
    }
    deleteThisOrder(dataId);
})

function deleteThisOrder(dataId) {
    axios.
        delete(`${url}/orders/${dataId}`, {
            headers: {
                Authorization: token
            }
        }).
        then(function (response) {
            console.log("delete success");
            renderOrderList(response);
            renderChartEachClass(calculateDataEachClass(response));
            renderChartEachProduct(calculateDataEachProduct(response));
        });
}

//5. 刪除全部訂單資料
// DOM orderPageList
// 監聽表單的點擊事件
// 如果點擊的位置，其 class="discardAllBtn"，就戳 API
// 重新渲染訂單畫面
let orderPageList = document.querySelector(".orderPage-list");
orderPageList.addEventListener("click", function (e) {
    if (e.target.getAttribute("class") != "discardAllBtn") {
        return;
    }
    Swal.fire({
        title: "確定要刪除訂單列表嗎？\n┌|◎o◎|┘",
        showDenyButton: true,
        // showCancelButton: true,
        confirmButtonText: " 是 ",
        denyButtonText: " 不是 ",
        customClass: {
            actions: 'my-actions',
            // cancelButton: 'order-1 right-gap',
            confirmButton: 'order-2',
            denyButton: 'order-3',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            deleteAllOrders();
        }
    })
})
function deleteAllOrders() {
    axios.
          delete(`${url}/orders`,{
            headers:{
                Authorization: token
            }
          }).
          then(function (response){
            renderOrderList(response);
            renderChartEachClass(calculateDataEachClass(response));
            renderChartEachProduct(calculateDataEachProduct(response));
            console.log(response.data.message);
            // Swal.fire("訂單已清空！(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "", "info");
          })
    
}



