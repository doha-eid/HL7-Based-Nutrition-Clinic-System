import {Patient} from "../models";
import {Request, Response, NextFunction, response} from "express";
import AsyncErrorCatching from "../utils/asyncErrorCatching";
import ErrorHandler from "../utils/ErrorHandler";
import {filterObj} from "../utils/helpers";
import * as hl7 from 'simple-hl7';
import {buildHL7ADTMessage, hl7ToJSON} from "../utils/hl7Utils";
import {correctParsedMessage} from "../utils/helpers";

export const getPatients = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const patients = await Patient.find();

    res.status(200).json({
        status: "success",
        results: patients.length,
        data: {
            patients,
        },
    });

});
export const getPatient = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const patient = await Patient.findById(data.params.id);

    if (!patient) {
        return next(new ErrorHandler("No patient found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            patient,
        },
    });
});
export const createPatient = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {

    // check if patient already exists
    const patient = await Patient.findOne({email: data.body.email});

    if (patient) {
        return next(new ErrorHandler("Patient already exists", 400));
    }

    const newPatient = await Patient.create(data.body);

    res.status(201).json({
        status: "success",
        data: {
            patient: newPatient,
        },
    });
});
export const updatePatientInfo = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const filteredBody = filterObj(data.body, "firstName", "lastName", "email", "birthdate", "phone", "address", "associatedDoctor");

    const patient = await Patient.findByIdAndUpdate(data.params.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    if (!patient) {
        return next(new ErrorHandler("No patient found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            patient,
        },
    });
});
export const updatePatientMedicalHistory = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const filteredBody = filterObj(data.body,
        "allergies",
        "surgeries",
        "medications",
        "medicalConditions",
        "inBodyScores",
        "dietPlans",
        "prescriptions",
        "medicalTests",
    );


    const patient = await Patient.findById(data.params.id);

    if (!patient) {
        return next(new ErrorHandler("No patient found with that ID", 404));
    }

    // find the fields that is present in the datauest body
    const keys = Object.keys(filteredBody);

    // update the patient's medical history with the fields present in the datauest body
    keys.forEach((key) => {
        if (patient.medicalHistory && (patient.medicalHistory as any)[key]) {
            console.log(key, (filteredBody as any)[key]);
            (patient.medicalHistory as any)[key] = (filteredBody as any)[key];
        }
    });

    await patient.save();

    res.status(200).json({
        status: "success",
        data: {
            patient,
        },
    });

});
export const deletePatient = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const patient = await Patient.findByIdAndDelete(data.params.id);

    if (!patient) {
        return next(new ErrorHandler("No patient found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

export const referPatientToAnotherClinic = AsyncErrorCatching(async (data: Request, res: Response, next: NextFunction) => {
    const patient = await Patient.findById(data.params.id);

    if (!patient) {
        return next(new ErrorHandler("No patient found with that ID", 404));
    }

    const {clinicId} = data.body;

    // @ts-ignore
    const client = hl7.Server.createTcpClient({
        host: 'localhost',
        port: process.env.OTHER_CLINIC_TCP_PORT || 7777,
        callback: (err: Error, ack: any) => {

            if (err) {
                console.log("******* ERROR ********");
                console.log(err.message);
                return next(new ErrorHandler("Error sending message to clinic", 500));

            } else {
                console.log("******* ACK Received ********");

                if (ack.segments[1] && ack.segments[1].name === "ERR") {
                    return next(new ErrorHandler(ack.segments[1].fields[0].value, 500));
                }

                res.status(200).json({
                    status: "success",
                    message: `Patient ${patient.firstName} has been referred to clinic ${clinicId} successfully.`,
                });
            }

        }
    });


    const message = buildHL7ADTMessage(patient);

    console.log(`**** Sending HL7 Message to ${clinicId} on port ${process.env.OTHER_CLINIC_TCP_PORT || 7777} ****`);
    console.log(message.log());

    client.send(message);

});

export const handleReceivedHL7Message = async (data: any) => {
    console.log(' **** Message Recieved From ' + data.facility);

    if (data.type != 'ADT') {
        return
    }

    if (data.msg === undefined) {
        return
    }

    console.log(data.msg.log());

    const patientParsedData = hl7ToJSON(data.msg.toString());

    console.log("**** Parsing HL7 Message ****");

    // check if patient already exists
    const patient = await Patient.findOne({email: patientParsedData.email});

    if (patient) {
        throw new ErrorHandler("Patient already exists", 400);
    }

    const correctData = correctParsedMessage(patientParsedData);

    console.log(correctData);

    await Patient.create(correctData);
    console.log("Patient created successfully");

    return {
        status: "success",
        message: "Patient created successfully",
    };
}



