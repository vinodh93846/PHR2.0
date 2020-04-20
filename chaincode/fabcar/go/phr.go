

 package main

 import (
	 "encoding/json"
	 "fmt"
	 "time"
	 "github.com/hyperledger/fabric-contract-api-go/contractapi"
	 "github.com/google/uuid"
 )
 
 // SmartContract provides functions for managing a car
 type SmartContract struct {
	 contractapi.Contract
 }
 type Doctor struct {
	Id			   	string		   `json:"id"`
	PersonalDetails ContactDetails `json:"contact_details"`	
	CreatedDate	   	string		   `json:"created"`
	LicenseNo	   	string		   `json:"license"`
  	Status		   	string		   `json:"status"`
}
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Doctor

}
type QueryPatient struct {
	Key    string `json:"Key"`
	Record *Patient

}
type QueryReport struct {
	Key    string `json:"Key"`
	Record *Report

}
type QueryPrescriptionbyId struct {
	//PrescriptionIds []string	   `json:"prescription_ids"`//	 
	Record *Prescription

}
type QueryReportbyId struct {
	Record *Report
//	RecordIds string	  `json:"report_ids"`
//Length int  `json:"len"`
}
type QueryPrescription struct {
	Key    string `json:"Key"`
	Record *Prescription

}
type QueryHistory struct {
	TransactionId    string `json:"transactionId"`
	TransactionTimestamp string `json:"transactionTimestamp"`
	IsDelete bool `json:"isDelete"`
}
type ContactDetails struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email	  string `json:"email"`
	Address	  string `json:"address"`
	State	  string `json:"state"`
	City	  string `json:"city"`
}
type Patient struct {
	Id				string		   `json:"id"`
	PersonalDetails ContactDetails `json:"contact_details"`
	CreatedDate 	string		   `json:"created"`
  	YearOfBirth		string		   `json:"birth_year"`
	Gender			string		   `json:"gender"`
	ReportIds		[]string	   `json:"report_ids"`
	PrescriptionIds []string	   `json:"prescription_ids"`	  
}

//type PrescriptionIds [5]string
type Report struct {
	Id			string `json:"id"`
	RefDoctor	string `json:"refDoctor"`
	CodeID		string `json:"codeID"`
	ReportType	string `json:"reportType"`
	ReportName	string `json:"reportName"`
	PatientName	string `json:"patientName"`
	PatientID	string `json:"patientID"`
	Date		string `json:"date"`
	ReportData	string `json:"reportData"`
	SubmitType	string `json:"submitType"`
}
type Prescription struct {
	Id				 string `json:"id"`
	DoctorName		 string `json:"doctorName"`
	DoctorID		 string `json:"doctorID"`
	PrescriptionData string `json:"prescriptionData"`
	PatientName		 string `json:"patientName"`
	PatientID		 string `json:"patientID"`
	Drugs			 string `json:"drugs"`
	RefillCount		 string	`json:"refillCount"`
	VoidAfter		 string `json:"voidAfter"`
	Date			 string `json:"date"`
}
 func GetUId() (string, error) {
	id, err := uuid.NewUUID()
    if err != nil {
        return "", err
    }
    return id.String(), err
}

 // InitLedger adds a base set of cars to the ledger
func (s *SmartContract) Init(ctx contractapi.TransactionContextInterface) error {	
	fmt.Printf("Hello\n")
	return nil
 }


func (s *SmartContract) AddDoctor(ctx contractapi.TransactionContextInterface,firstName string,lastName string,email string,address string,city string,state string,licenseNo string,status string) error {


	fmt.Printf("Adding doctor to the ledger ...\n")
	// if len(args) != 8 {
	// 	return fmt.Errorf("InvalidArgumentError: Incorrect number of arguments. Expecting 8")
    // }

    //Prepare key for the new Org
	uid, err := GetUId()
	if err != nil {
		return fmt.Errorf("%s", err)
	}
	id := "Doctor-" + uid
	createdate := time.Now().Format("2006-01-02 15:04:05")
	fmt.Printf("Validating doctor data\n")
	//Validate the Org data
	var contactDetails = ContactDetails{
						FirstName: firstName,
						LastName: lastName,
						Email: email,
						Address: address,
						City: city,
						State: state}	
	var doctor = Doctor{Id: id,			   
					PersonalDetails: contactDetails,
					CreatedDate: createdate,
					LicenseNo: licenseNo,
		  			Status:status}

	//Encrypt and Marshal Org data in order to put in world state
	fmt.Printf("Marshalling doctor data\n")
	doctorAsBytes, err := json.Marshal(doctor)
	if err != nil {
		return fmt.Errorf("MarshallingError: %s", err)
	}

	//Add the Org to the ledger world state
	err = ctx.GetStub().PutState(id, doctorAsBytes)
	if err != nil {
		return fmt.Errorf("LegderCommitError: %s", err)
	}

	fmt.Printf("Added Doctor Successfully\n")
	payload := fmt.Sprintf("{\"firstName\": \"%s\",\"lastName\": \"%s\",\"id\": \"%s\",\"email\": \"%s\"}",firstName,lastName,id,email)
	eventErr := ctx.GetStub().SetEvent("DoctorAddedEvent", []byte(payload))
	if (eventErr != nil) {
		return fmt.Errorf("Failed to emit event")
   }
	return nil
}
func (s *SmartContract) GetDoctors(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	query := "{\"selector\": {\"_id\": {\"$regex\": \"^Doctor-\"} } }"
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()
	results := []QueryResult{}
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		doctor := new(Doctor)
		_ = json.Unmarshal(queryResponse.Value, doctor)
		queryResult := QueryResult{Key: queryResponse.Key, Record: doctor}
		results = append(results, queryResult)
	}
	return results, nil
}
func (s *SmartContract) GetPatients(ctx contractapi.TransactionContextInterface) ([]QueryPatient, error) {
	query := "{\"selector\": {\"_id\": {\"$regex\": \"^Patient-\"} } }"
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()
	result := []QueryPatient{}
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		patient := new(Patient)
		_ = json.Unmarshal(queryResponse.Value, patient)
		queryResult := QueryPatient{Key: queryResponse.Key, Record: patient}
		result = append(result, queryResult)
	}
	return result, nil
}

func (s *SmartContract) ChangeStatus(ctx contractapi.TransactionContextInterface,docterId string,status string) error {
	fmt.Printf("Changing Status in the ledger ...\n")

	doctorAsBytes, err := ctx.GetStub().GetState(docterId)
	var doctor = Doctor{};
	json.Unmarshal(doctorAsBytes, &doctor);
	doctor.Status = status;

	//Encrypt and Marshal Org data in order to put in world state
	fmt.Printf("Marshalling doctor data\n")
	doctorAsBytes, err = json.Marshal(doctor)
	if err != nil {
		return fmt.Errorf("MarshallingError: %s", err)
	}
	
	//Add the Org to the ledger world state
	err = ctx.GetStub().PutState(docterId, doctorAsBytes)
	if err != nil {
		return fmt.Errorf("LegderCommitError: %s", err)
	}

  	fmt.Printf("Changed Status Successfully\n")
	  return nil
	}

func (s *SmartContract) AddPatient(ctx contractapi.TransactionContextInterface,firstName string,lastName string,email string,address string,city string,state string,yearOfBirth string,gender string) error {
		fmt.Printf("Adding Patient to the ledger ...\n")
	
		//Prepare key for the new Org
		uid, err := GetUId()
		if err != nil {
			return fmt.Errorf("%s", err)
		}
		id := "Patient-" + uid
		createdate := time.Now().Format("2006-01-02 15:04:05")
		fmt.Printf("Validating Patient data\n")
		//Validate the Patient data
		var contactDetails = ContactDetails{FirstName: firstName,
											LastName: lastName,
											Email: email,
											Address: address,
											City: city,
											State: state}
		var patient = Patient{Id: id,			   
							  PersonalDetails: contactDetails,
							  CreatedDate: createdate,
							  YearOfBirth: yearOfBirth,
							  Gender:gender,
							  ReportIds: make([]string, 0),
							  PrescriptionIds: make([]string, 0)}
		
		//Marshal and Encrypt Patient data in order to put in world state
		fmt.Printf("Marshalling patient data\n")
		patientAsBytes, err := json.Marshal(patient)
		if err != nil {
			return fmt.Errorf("MarshallingError: %s", err)
		}
		
		//Add Patient to the ledger world state
		err = ctx.GetStub().PutState(id, patientAsBytes)
		if err != nil {
			return fmt.Errorf("LegderCommitError: %s", err)
		}
	
		payload := fmt.Sprintf("{\"firstName\": \"%s\",\"lastName\": \"%s\",\"id\": \"%s\",\"email\": \"%s\"}",firstName,lastName,id,email)
		eventErr := ctx.GetStub().SetEvent("PatientAddedEvent",[]byte(payload))
		if (eventErr != nil) {
			return fmt.Errorf("Failed to emit event")
	   }
	
		fmt.Printf("Added Patient Successfully\n")
		return nil
	}

func (s *SmartContract) AddPrescription(ctx contractapi.TransactionContextInterface,doctorName string,doctorID string,prescriptionData string,patientName string,patientID string,drugs string,refillCount string,voidAfter string) error {
		fmt.Printf("Adding Prescription to the ledger ...\n")
		//Prepare key for the new Org
		uid, err := GetUId()
		if err != nil {
			return fmt.Errorf("%s", err)
		}
		id := "Prescription-" + uid
		createdate := time.Now().Format("2006-01-02 15:04:05")
	
		var prescription = Prescription{ Id: id,			   
							  DoctorName: doctorName,
							  DoctorID: doctorID,
							  PrescriptionData: prescriptionData,
							  PatientName: patientName,
							  PatientID: patientID,
							  Drugs: drugs,
							  RefillCount: refillCount,
							  VoidAfter: voidAfter,
							  Date: createdate }
		
		//add Prescription id in the doctor's patient ids list
		patientAsBytes, _ := ctx.GetStub().GetState(patientID)
	//	ptPatientAsBytes, _ := Decrypt(patientAsBytes, key, IV)
		patient := Patient{}
		err = json.Unmarshal(patientAsBytes, &patient)
		if err != nil {
				return fmt.Errorf("%s", err)
		}
		patient.PrescriptionIds = append(patient.PrescriptionIds, id)
		patientJSONAsBytes, _ := json.Marshal(patient)
		//ctPatientAsBytes, _ := Encrypt(patientJSONAsBytes, key, IV)
		ctx.GetStub().PutState(patientID, patientJSONAsBytes)
	
		//Marshal and Encrypt Prescription data in order to put in world state
		fmt.Printf("Marshalling Prescription data\n")
		prescriptionAsBytes, err := json.Marshal(prescription)
		if err != nil {
			return fmt.Errorf("MarshallingError: %s", err)
		}
		
	
		//Add Patient to the ledger world state
		err = ctx.GetStub().PutState(id, prescriptionAsBytes)
		if err != nil {
			return fmt.Errorf("LegderCommitError: %s", err)
		}
	
		fmt.Printf("Added Prescription Successfully\n")
		return nil
	}
	
func (s *SmartContract) GetPrescriptions(ctx contractapi.TransactionContextInterface) ([]QueryPrescription, error) {
	
		query := "{\"selector\": {\"_id\": {\"$regex\": \"^Prescription-\"} } }"
		resultsIterator, err := ctx.GetStub().GetQueryResult(query)
		if err != nil {
			return nil, err
		}
		defer resultsIterator.Close()
	
		result := []QueryPrescription{}
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		prescription := new(Prescription)
		_ = json.Unmarshal(queryResponse.Value, prescription)
		queryResult := QueryPrescription{Key: queryResponse.Key, Record: prescription}
		result = append(result, queryResult)
	}
	return result, nil
}
func (s *SmartContract) AddReport(ctx contractapi.TransactionContextInterface,refDoctor string,codeID string,reportType string,reportName string,patientName string,patientID string,reportData string,submitType string,date string) error {
	fmt.Printf("Adding Report to the ledger ...\n")
	//Prepare key for the new Report
	uid, err := GetUId()
	if err != nil {
		return  fmt.Errorf("%s", err)
	}
	id := "Report-" + uid

	var report = Report{Id: id,			   
						  RefDoctor: refDoctor,
						  CodeID: codeID,
						  ReportType: reportType,
						  ReportName: reportName,
						  PatientName: patientName,
						  PatientID: patientID,
						  ReportData: reportData,
						  SubmitType: submitType,
						  Date: date}
	
	//add Prescription id in the doctor's patient ids list
	patientAsBytes, _ := ctx.GetStub().GetState(patientID)
	//ptPatientAsBytes, _ := Decrypt(patientAsBytes, key, IV)
	patient := Patient{}
	err = json.Unmarshal(patientAsBytes, &patient)
	if err != nil {
		return fmt.Errorf("%s", err)
	}
	patient.ReportIds = append(patient.ReportIds, id)
	patientJSONAsBytes, _ := json.Marshal(patient)
	//	ctPatientAsBytes, _ := Encrypt(patientJSONAsBytes, key, IV)
	ctx.GetStub().PutState(patientID, patientJSONAsBytes)

	//Marshal and Encrypt Prescription data in order to put in world state
	fmt.Printf("Marshalling Report data\n")
	reportAsBytes, err := json.Marshal(report)
	if err != nil {
		return fmt.Errorf("MarshallingError: %s", err)
	}
	
	//Add Report to the ledger world state
	err = ctx.GetStub().PutState(id, reportAsBytes)
	if err != nil {
		return fmt.Errorf("LegderCommitError: %s", err)
	}

	fmt.Printf("Added Report Successfully\n")
	return nil
}

func (s *SmartContract) GetReports(ctx contractapi.TransactionContextInterface) ([]QueryReport,error) {
	
	query := "{\"selector\": {\"_id\": {\"$regex\": \"^Report-\"} } }"
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
		if err != nil {
			return nil, err
		}
		defer resultsIterator.Close()
	
		result := []QueryReport{}
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		report := new(Report)
		_ = json.Unmarshal(queryResponse.Value, report)
		queryResult := QueryReport{Key: queryResponse.Key, Record: report}
		result = append(result, queryResult)
	
}
	return result, nil
}

func (s *SmartContract) GetPatientInfo(ctx contractapi.TransactionContextInterface, PatientId string) (*Patient, error) {
	patientAsBytes, err := ctx.GetStub().GetState(PatientId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if patientAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", PatientId)
	}

	patient := new(Patient)
	_ = json.Unmarshal(patientAsBytes, patient)

	return patient, nil
}

func (s *SmartContract) GetDoctorInfo(ctx contractapi.TransactionContextInterface, DoctorId string) (*Doctor, error) {
	doctorAsBytes, err := ctx.GetStub().GetState(DoctorId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if doctorAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", DoctorId)
	}

	doctor := new(Doctor)
	_ = json.Unmarshal(doctorAsBytes, doctor)

	return doctor, nil
}
func (s *SmartContract) GetPrescriptionById(ctx contractapi.TransactionContextInterface, PatientId string) ([]QueryPrescriptionbyId, error) {
	
	query := "{\"selector\": {\"_id\": {\"$regex\": \"^Prescription-\"} } }"
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	result := []QueryPrescriptionbyId{}
for resultsIterator.HasNext() {
	queryResponse, err := resultsIterator.Next()
	if err != nil {
		return nil, err
	}
	prescription := new(Prescription)
	_ = json.Unmarshal(queryResponse.Value, prescription)
	if prescription.PatientID == PatientId{

	queryResult := QueryPrescriptionbyId{Record: prescription}
	result = append(result, queryResult)
}
}
return result, nil
}
func (s *SmartContract) GetReportById(ctx contractapi.TransactionContextInterface, PatientId string) ([]QueryReportbyId, error) {
	query := "{\"selector\": {\"_id\": {\"$regex\": \"^Report-\"} } }"
	resultsIterator, err := ctx.GetStub().GetQueryResult(query)
		if err != nil {
			return nil, err
		}
		defer resultsIterator.Close()
	
		result := []QueryReportbyId{}
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		report := new(Report)
		_ = json.Unmarshal(queryResponse.Value, report)
		if report.PatientID == PatientId{
		queryResult := QueryReportbyId{Record: report}
		result = append(result, queryResult)
	}
}
	return result, nil
}

func (s *SmartContract) GetHistory(ctx contractapi.TransactionContextInterface,id string) ([]QueryHistory,error) {

	// if len(args) != 1 {
	// 	return shim.Error("Incorrect number of arguments. Expecting 'Patient ID'")
	// }

	//id := args[0]
	//ledger := peer.Operations.GetLedger(args[0])

	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()
	fmt.Printf("\n\nresultsIterator : ", resultsIterator)
	// buffer is a JSON array containing historic values for the marble
//	var buffer bytes.Buffer
result := []QueryHistory{}

for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
	//	report := new(Report)
		//_ = json.Unmarshal(response.Value)
		queryResult := QueryHistory{TransactionId:response.TxId,TransactionTimestamp:time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String(),IsDelete:response.IsDelete}
		result = append(result, queryResult)
	}
	return result, nil

}
func main() {
 
	 chaincode, err := contractapi.NewChaincode(new(SmartContract))
 
	 if err != nil {
		 fmt.Printf("Error create  chaincode: %s", err.Error())
		 return
	 }
 
	 if err := chaincode.Start(); err != nil {
		 fmt.Printf("Error starting  chaincode: %s", err.Error())
	 }
 }
 