package com.novelrealm.controller;

import com.novelrealm.dto.LoginRequest;
import com.novelrealm.dto.RegisterRequest;
import com.novelrealm.dto.UserResponse;
import com.novelrealm.model.User;
import com.novelrealm.service.AuthenticationService;
import com.novelrealm.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationService authenticationService;

    public AuthController(UserService userService, AuthenticationService authenticationService) {
        this.userService = userService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid RegisterRequest request) {
        User user = userService.register(
                request.pseudo(),
                request.email(),
                request.password(),
                User.AuthProvider.LOCAL); // ← inscription classique = compte LOCAL

        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
    
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        // 1. Vérifier les identifiants
        User user = userService.login(request.email(), request.password());

        // 2. Créer la session + le cookie 
        authenticationService.authenticate(user, httpRequest, httpResponse);

        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        authenticationService.logout(httpRequest, httpResponse);
        return ResponseEntity.noContent().build(); // 204 : "c'est fait, rien à renvoyer"
    }
}