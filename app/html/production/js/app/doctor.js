'use strict';

function initPage() {
    closeAddPatient();
    listPatients();
    doctorDetail();
    $('body').find('redirection').each(function(index, element) {
        currentLink = element.attr('href');
        console.log("currentLink : ",currentLink)
        updatedLink = currentLink+$_GET('doctor_id')
        $(this).attr('href', updatedLink);
    });
    
}

function closeAddPatient() {
    $('#add_patient').slideUp(3000);
}

let __patient_filter = '';
let __first = '';

function showFussyModal() {
    $('.bs-fussy-modal-sm').modal('show');
}

function showBioModal() {
    closeEmergencyModal();
    $('.bs-bio-modal-sm').modal('show');
}

function closeQRModal() {
    $('.bs-qr-modal-sm').modal('hide');
}

function showQRModal() {
    $('.bs-qr-modal-sm').modal('show');
}

function closeFussyModal() {
    $('.bs-fussy-modal-sm').modal('hide');
}

function showEmergencyModal() {
    $('.bs-emergency-modal-sm').modal('show');
}

function closeEmergencyModal() {
    $('.bs-emergency-modal-sm').modal('hide');
}

function addPatient() {

    var first_name = document.getElementById('first-name').value;
    var last_name = document.getElementById('last-name').value;
    var gender = document.getElementById('gender').value;
    var birth_year = document.getElementById('birth_year').value;
    var email = document.getElementById('email').value.toString().trim();
    var address = document.getElementById('address').value;
    var state = document.getElementById('state').value;
    var city = document.getElementById('city').value;

    let options = {
        'first_name': first_name,
        'last_name': last_name,
        'gender': gender,
        'birth_year': birth_year,
        'email': email,
        'address': address,
        'state': state,
        'city': city
    };
    startProgress();

    $.ajax({
        url: '/composer/client/addPatient',
        type: 'post',
        data: options,
        headers: {
            "Authorization": 'Bearer ' + sessionStorage.token   //If your header name has spaces or any other char not appropriate for object property name, use quoted notation shown in second
        },
        success: function (_res) {

            if(!_res.error){
                closeAddPatient();
                closeProgress();
                new PNotify({
                    title: 'Success',
                    text: 'Patient added Successfully!',
                    type: 'success',
                    hide: true,
                    styling: 'bootstrap3'
                });
        }else{
            closeProgress();
            new PNotify({
                title: 'Failed',
                text: 'Mail Id already registered!',
                type: 'error',
                hide: true,
                styling: 'bootstrap3'
            });
        }
            listPatients();
        },
        error: function () {
            console.log('doctor:- addPatient error');
        }
    });
}

function searchPatient() {
    let search = document.getElementById('search').value;
    startProgress();
    setTimeout(function () {
        __patient_filter = search;
        listPatients();
        closeProgress();
    }, 1000);
}

function fussySearch() {
    closeFussyModal();
    startProgress();
    setTimeout(function () {
        __patient_filter = __first;
        listPatients();
        closeProgress();
    }, 1000);
}

function qrSearch() {
    closeQRModal();
    startProgress();
    setTimeout(function () {
        document.getElementById('search').value = __first;
        __patient_filter = __first;
        listPatients();
        closeProgress();
    }, 1000);
}

/**
 * listDoctors
 */
function listPatients() {

    let _doctor_id = $_GET('doctor_id');
    $.ajax({
        url: '/composer/client/getPatients',
        headers: {
            "Authorization": 'Bearer ' + sessionStorage.token
        },
        success: function (_res) {
            console.log(_res.patient_list);

            let _str = table_begin + table_header;
            if (_res.result === 'success') {
                _str += '<tbody>';
                for (let each in _res.patient_list) {
                    (function (_idx, _arr) {
                        let _row = _arr[_idx].Record;
                        if (__first == '') __first = _row.id;

                        let color = (_row.status == 'Active') ? 'success' : 'warning';
                        //if(_row.id != __patient_filter) return;
                        _str += '<tr><td>#</td>' +
                            '<td>' +
                            '<a>' + _row.contact_details.first_name + ' ' + _row.contact_details.last_name + '</a><br />' +
                            '<small>' + convertDate(_row.created) + '</small>' +
                            '</td>' +
                            '<td>' +
                            '<a onclick="generateOTP(\'' + _row.contact_details.email + '\',\'' + _row.id + '\')" class="btn btn-info btn-xs">' +
                            '<i class="fa fa-eye"></i> Request Access </a>' +
                            '</td>' +
                            '<td id="otp_group1">' +
                            '<input id="otp' + _row.id + '" type="text" class="form-control" placeholder="Access OTP">' +
                            '</td>' +
                            '<td id="otp_group2">' +
                            '<a onclick="confirmOTP(\'' + _row.id + '\',\'' + _doctor_id + '\');" class="btn btn-info btn-xs">' +
                            '<i class="fa fa-eye"></i> Confirm </a>' +
                            '</td>' +
                            '</tr>';
                    })(each, _res.patient_list);
                }
                _str += '</tbody>' + table_end;
            } else {
                new PNotify({
                    title: 'Error',
                    text: 'Retriving Doctors failed!',
                    type: 'error',
                    hide: true,
                    styling: 'bootstrap3'
                });

            }
            document.getElementById('patient_list').innerHTML = _str;
            refreshName(_res.patient_list.length);
        },
        error: function (jqXHR, type, thrown) {
            console.log('Doctor:- getPatients Error: ' + type + ' - ' + thrown);
        }
    });
}

let table_begin = '<table class="table table-striped projects">';
let table_end = '</table>';
let table_header = '<thead>' +
    '<tr>' +
    '<th style="width: 1%">#</th>' +
    '<th style="width: 20%">Patient\'s Records</th>' +
    '<th style="width: 20%">#Edit</th>' +
    '<th style="width: 20%">#OTP</th>' +
    '<th style="width: 20%">#Confirm</th>' +
    '</tr>' +
    '</thead>';

//let _otp = '';
let _patient_id = '';
let _email = '';

// function confirmOTP(patien_id, doctor_id) {
//     let otp = document.getElementById('otp'+patien_id).value;
//     if(_otp!=otp || patien_id != _patient_id) {
//         alert("Incorrect OTP");
//         return;
//     }
//     window.location = 'phr_doctor_patient.html?patient_id=' + patien_id + '&doctor_id=' + doctor_id;
// }


function confirmOTP(patien_id, doctor_id) {
    let otp = document.getElementById('otp' + patien_id).value;
    if(patien_id==_patient_id){

        let options = {

            'email': _email,
            'doctor_id': doctor_id,
            'patient_id': patien_id,
            'otp': otp
    
        };

        $.ajax({
            url: '/composer/client/AccessOTPValidate',
            data: options,
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.token
            },
            dataType: 'json',
            success: function (_res) {
                if(_res.result == 'success'){
                    window.location = 'phr_doctor_patient.html?patient_id=' + _res.patient_id + '&doctor_id=' + _res.doctor_id;
                }else{
                    new PNotify({
                        title: 'Failed',
                        text: _res.error,
                        type: 'error',
                        hide: true,
                        styling: 'bootstrap3'
                    });
                }
                
                
    
    
            },error: function (jqXHR, type, thrown) {
                console.log('Error: ' + type + ' - ' + thrown);
            }
        })

    }
    
   


}

function generateOTP(email, patientID) {

    console.log("Request for Access : " + email + " ==> " + patientID)
    startProgress();
    setTimeout(function () {

        let options = {

            'email': email,
            'doctor_id': $_GET('doctor_id'),
            'patient_id': patientID
        };
        $.ajax({
            url: '/composer/client/generateOTP',
            data: options,
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.token
            },
            dataType: 'json',
            success: function (_res) {
                if (_res.result == 'success') {
                    // _otp = _res.otp;
                    _patient_id = patientID;
                    _email = email;
                    console.log("OTP Generated for : ", _patient_id)
                    new PNotify({
                        title: 'Success',
                        text: 'An OTP has been sent to the registerd email ID. Please use the OTP for access. </br> </br> OTP is valid only for 5 minutes.',
                        type: 'success',
                        hide: true,
                        styling: 'bootstrap3'
                    });
                } else {
                    new PNotify({
                        title: 'Failed',
                        text: _res.error,
                        type: 'error',
                        hide: true,
                        styling: 'bootstrap3'
                    });
                }
                closeProgress();
            },
            error: function (jqXHR, type, thrown) {
                console.log('Error: ' + type + ' - ' + thrown);
            }
        });
    }, 3000);

}

function doctorDetail() {
    console.log("doctorDetails function called inside doctor.js ......")
    let doc_id = $_GET("doctor_id");
    let IDCheck = doc_id.toString().split('-');
    //console.log(IDCheck)
    if (IDCheck.length != 6) {
        $.ajax({
            url: '/composer/client/getDoctors',
            headers: {
                "Authorization": 'Bearer ' + sessionStorage.token
            },

            success: function (_doctors) {
                console.log("List of Doctors : ", _doctors.doctor_list);
                let data = _doctors.doctor_list;
                console.log(_doctors.doctor_list[0].contact_details)
                var wrong_doctor_id = $_GET("doctor_id");
                console.log('Wrong doctor ID (Doctor Name) : ', wrong_doctor_id);
                let i;
                for (i = 0; i < _doctors.doctor_list.length; ++i) {
                    let nameCheck = data[i].contact_details.first_name + " " + data[i].contact_details.last_name;
                    if (wrong_doctor_id == nameCheck) {
                        console.log("data[i] : ", data[i])
                        //sessionStorage.setItem('doctor',JSON.stringify(data[i]));
                        sessionStorage.setItem('doctor', JSON.stringify(data[i]));
                        console.log("Doctor Creds : ", data[i])
                        console.log("Doc details in session !!");
                        break;
                    }
                }
            }

        })
    }


}