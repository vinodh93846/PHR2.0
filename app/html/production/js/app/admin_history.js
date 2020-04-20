'use strict';

function initPage() {
    updateDoctorCount();
    updatePatientCount();
    updatePrescriptionCount();
    listIDs();
    // getHistorian();
}

function updateDoctorCount() {
    $.ajax({
        url: '/composer/client/getDoctorCount',
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token
        },
        success: function (_res) {
            $('#doctor_count').html(_res.count);
        },
        error: function (jqXHR, type, thrown ) {
            console.log('admin_history:- getDoctorCount Error: '+type+' - '+thrown);
        }
    });
}

function updatePatientCount() {
    $.ajax({
        url: '/composer/client/getPatientCount',
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token
        },
        success: function (_res) {
            $('#patient_count').html(_res.count); $('#patient_count2').html(_res.count);
        },
        error: function (jqXHR, type, thrown ) {
            console.log('admin_history:- getPatientCount Error: '+type+' - '+thrown);
        }
    });
}

function updatePrescriptionCount() {
    $.ajax({
        url: '/composer/client/getPrescriptionCount',
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token
        },
        success: function (_res) {
            let count = _res.count; 
            $.ajax({
                url: '/composer/client/getReportCount',
                headers: {
                    "Authorization": 'Bearer '+sessionStorage.token
                },
                dataType: 'json',
                success: function (_res) {
                    $('#document_count').html(count + _res.count);
                },
                error: function (jqXHR, type, thrown ) {
                    console.log('admin_history:- getReportCount Error: '+type+' - '+thrown);
                }
            });
        },
        error: function (jqXHR, type, thrown ) {
            console.log('admin_history:- getPrescriptionCount Error: '+type+' - '+thrown);
        }
    });
}

function closeAddDoctor() {
    $('#add_doctor').slideUp(3000);
}

function addDoctor() {

    var first_name = document.getElementById('first-name').value;
    var last_name = document.getElementById('last-name').value;
    var license = document.getElementById('license').value;
    var email = document.getElementById('email').value;
    var address = document.getElementById('address').value;
    var state = document.getElementById('state').value;
    var city = document.getElementById('city').value;

    let options = {
        'first_name': first_name,
        'last_name': last_name,
        'license_no': license,
        'status': 'Active',
        'email': email,
        'address': address,
        'state': state,
        'city': city
    };
    startProgress();

    $.ajax({
        url: '/composer/client/addDoctor',
        type: 'post',
        data: options,
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token  
        },
        success: function (_res) {
      
            closeAddDoctor();
            closeProgress();
            new PNotify({
                title: 'Success',
                text: 'Doctor added Successfully!',
                type: 'success',
                hide: true,
                styling: 'bootstrap3'
            });
            listDoctors();
        },
        error: function () {
            console.log('admin_history:- addDoctor error');
        }
    });
}



let table_begin = '<table class="table table-striped projects">';
let table_end = '</table>';
let table_header = '<thead><tr><th style="width: 5%">#</th><th style="width: 30%">Doctor\'s Name</th><th>License Number</th><th>Status</th><th style="width: 20%">#Edit</th></tr></thead>';

function setPermission(id, active_status) {
    console.log("active_status :"+active_status);
    if (active_status) {
        if (confirm('Are you sure you want to revoke permissions?')) {
        var color = 'warning';
        var options = {
            'id' : id,
            'status' : 'Suspended'}
        $.ajax({
            url: '/composer/client/changeStatus',
            type: 'post',
            data: options,
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.token
            },
            success: function (_res) {

                document.getElementById('btn_\''+id+'\'').className = 'btn btn-'+color+' btn-xs';
                document.getElementById('btn_\''+id+'\'').innerText = 'Suspended';
            },
            error: function (jqXHR, type, thrown ) {
                console.log(type+' - '+thrown);
            }
        });
    }
    } else {
        if (confirm('Are you sure you want to Active permission?')) {
        var color = 'success';
        var options = {
            'id' : id,
            'status' : 'Active'}
        $.ajax({
            url: '/composer/client/changeStatus',
            type: 'post',
            data: options,
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.token
            },
            success: function (_res) {

                document.getElementById('btn_\''+id+'\'').className = 'btn btn-'+color+' btn-xs';
                document.getElementById('btn_\''+id+'\'').innerText = 'Active';
            },
            error: function (jqXHR, type, thrown ) {
                console.log(type+' - '+thrown);
            }
        });
        }
    }   
}


/**
 * get History
 */
function getHistorian() {
    event.preventDefault();
    startProgress();
    
    console.log("getHistorian() ..... ")
    var option = {
        history_id : document.getElementById('history_id').value
    }
    $.ajax({
        url: '/composer/client/getHistory',
        data : option,
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token
        },
        success: function (_res) {
            console.log("\n\nadmin_history.js : getHistorian() : res : ",_res)
            let _str = '<h4> HyperLedger Transaction Blocks: ' + _res.result + '</h4>';
            if (_res.result === 'success') {
                _str += '<h3>Total Transaction Count: ' + _res.history.length + '</h3>';
                _str += history_table_begin + history_table_header;
                _res.history.sort(function (a, b) { return (b.transactionTimestamp > a.transactionTimestamp) ? -1 : 1; });
                for (let each in _res.history) {
                    (function (_idx, _arr) {
                        let _row = _arr[_idx];
                        // _str += '<tr><td>' + _row.TxId + '</td><td>' + _row.transactionType + '</td><td>' + _row.transactionTimestamp + '</td></tr>';
                        _str += '<tr><td>' + _row.transactionId + '</td><td>' + _row.transactionTimestamp + '</td></tr>';
                    })(each, _res.history);
                }
                _str += history_table_end;
            }
            else { _str += formatMessage(_res.message); }
            document.getElementById('historian').innerHTML = _str;
            closeProgress();            
        },
        error: function (jqXHR, type, thrown ) {
            console.log('admin_history:- getHistory Error: '+type+' - '+thrown);
        }
    });
}




function listIDs() {

    
    $.ajax({
        url: '/composer/client/getPatients',
        headers: {
            "Authorization": 'Bearer '+sessionStorage.token
        },
        success: function (_res1) {
            console.log("getPatients :",_res1.patient_list)
            $.ajax({
                url: '/composer/client/getDoctors',
                headers: {
                    "Authorization": 'Bearer '+sessionStorage.token
                },
                success: function (_res2) {
                    console.log("getDoctors :",_res2.doctor_list)
                    let idList = [];
                    let x,y,z;
                    for(x=0;x<_res1.patient_list.length;++x){
                        
                        idList.push(_res1.patient_list[x].Record.id)
                    }
                    for(y=0;y<_res2.doctor_list.length;++y){

                        idList.push(_res2.doctor_list[y].Record.id)
                    }
                    var optionString = "";
                    for(z=0;z<idList.length;++z){
                        optionString+= '<option  value="'+idList[z]+'">'+idList[z]+'</option>'
                    }
                    console.log(optionString)
                    document.getElementById('history_id').innerHTML=optionString;



            },
                error: function (jqXHR, type, thrown ) {
                    console.log('admin:- getDoctors Error: '+type+' - '+thrown);
                }
            });

           
        },
        error: function (jqXHR, type, thrown ) {
            console.log('Doctor:- getPatients Error: '+type+' - '+thrown);
        }
    });
}


    function getSelected(){
        document.getElementById('historySubmit').innerHTML = "Transaction Details of "+historyForm.history_id[historyForm.history_id.selectedIndex].text;
    }

let history_table_begin = '<table class="table table-striped projects">';
let history_table_end = '</table>';
let history_table_header = '<thead><tr><th style="width: 50%">Transaction id</th><th>TimeStamp</th></thead>';
