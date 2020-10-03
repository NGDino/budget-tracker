window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let db;

let request = window.indexedDB.open('budget', 1);
    

request.onerror = function(e){
    console.log("error", e.target.errorCode);
}

request.onupgradeneeded= function (e) {
    const db = e.target.result;
    db.createObjectStore('transactionStore', {autoIncrement: true});
};

request.onsuccess = function(e){
    db= e.target.result

    if (navigator.onLine){
        uploadTransaction()
    }
};


//submit record when offline
function saveRecord(record){
    //start transaction
    const tx = db.transaction(['transactionStore'], 'readwrite' );
    //open object stor
    const txObjectStore = tx.objectStore('transactionStore');
    //add record
    txObjectStore.add(record)
    console.log(record)

}

function uploadTransaction(){
    //start transaction
    const tx = db.transaction(['transactionStore'], 'readwrite' );
    //open object store
    const txObjectStore = tx.objectStore('transactionStore');
    //get all records
    const getAll = txObjectStore.getAll()

    getAll.onsuccess = function () {
        if (getAll.result.length > 0){
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(fetchResponse => {
                if(fetchResponse.message){
                    throw new Error(fetchResponse)
                }
                //open another transaction
                const tx = db.transaction(['transactionStore'], 'readwrite' );
                const txObjectStore = tx.objectStore('transactionStore');
                txObjectStore.clear();

                alert('Transactions have been submitted!');
            })
            .catch(err =>{
                console.log(err)
            })
        }
    }
}

window.addEventListener('online', uploadTransaction);