package com.fintrack.fintrack_backend;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "http://localhost:5173")
public class StatementController {

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "password", required = false) String password) {

        double income = 0.0;
        double expenses = 0.0;
        String fileName = file.getOriginalFilename();

        try {
            if (fileName != null && fileName.toLowerCase().endsWith(".pdf")) {
                // PDF Parsing & Decryption Logic using Apache PDFBox
                byte[] bytes = file.getBytes();
                PDDocument document;
                
                if (password != null && !password.isEmpty()) {
                    document = Loader.loadPDF(bytes, password);
                } else {
                    document = Loader.loadPDF(bytes);
                }

                PDFTextStripper stripper = new PDFTextStripper();
                String pdfText = stripper.getText(document);
                document.close();

                // Regex matcher to extract numerical transaction values from PDF text
                Pattern pattern = Pattern.compile("[-+]?\\d*\\.?\\d+");
                Matcher matcher = pattern.matcher(pdfText);

                while (matcher.find()) {
                    try {
                        double val = Double.parseDouble(matcher.group());
                        if (val > 0) {
                            income += val;
                        } else {
                            expenses += Math.abs(val);
                        }
                    } catch (NumberFormatException ignored) {}
                }

            } else {
                // CSV Parsing Logic using Apache Commons CSV with Try-With-Resources (Prevents Resource Leak)
                try (BufferedReader fileReader = new BufferedReader(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
                     CSVParser csvParser = new CSVParser(fileReader, CSVFormat.DEFAULT
                        .builder()
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreHeaderCase(true)
                        .setTrim(true)
                        .build())) {

                    for (CSVRecord record : csvParser) {
                        if (record.isMapped("Amount")) {
                            double amount = Double.parseDouble(record.get("Amount"));
                            if (amount > 0) {
                                income += amount;
                            } else {
                                expenses += Math.abs(amount);
                            }
                        }
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("income", income);
            response.put("expenses", expenses);
            response.put("accountBalance", income - expenses);
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process statement: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}