"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-dist/swagger-ui.css";

export default function ApiDocs() {
    return (
        <div style={{ padding: "20px" }}>
            <SwaggerUI url="/openapi.yaml" />
        </div>
    );
}