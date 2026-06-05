package com.novelrealm.exception;

import com.novelrealm.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyUsed(EmailAlreadyUsedException ex) {

        ErrorResponse error = new ErrorResponse(
                HttpStatus.CONFLICT.value(), // 409
                ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}