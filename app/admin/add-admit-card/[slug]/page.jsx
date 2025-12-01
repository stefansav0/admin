"use client";

import React from "react";
import AdminAddAdmitCardForm from "../AdminAddAdmitCardForm";

import { useParams } from "next/navigation";

const EditAdmitCardPage = () => {
    const { slug } = useParams();

    return <AdminAddAdmitCardForm isEdit={true} slug={slug} />;
};

export default EditAdmitCardPage;
