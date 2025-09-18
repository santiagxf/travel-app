import * as traceloop from "@traceloop/node-server-sdk";
import { ConsoleSpanExporter, SpanExporter } from '@opentelemetry/sdk-trace-base';
import 'openai/shims/node';
import OpenAI from "openai";
import { AzureMonitorTraceExporter } from '@azure/monitor-opentelemetry-exporter';

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
var exporter: SpanExporter;

if (!connectionString) {
   exporter = new ConsoleSpanExporter();
}
else {
    exporter = new AzureMonitorTraceExporter({
        connectionString,
    }) as unknown as SpanExporter;
}

traceloop.initialize({
  appName: "TravelGuideService",
  // @ts-ignore - Ignoring type mismatch between different OpenTelemetry packages
  exporter: exporter,
  disableBatch: true,
  instrumentModules: {
    openAI: OpenAI,
  },
});