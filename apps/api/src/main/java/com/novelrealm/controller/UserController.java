package com.novelrealm.controller;

import com.novelrealm.dto.RegisterRequest;
import com.novelrealm.dto.UserResponse;
import com.novelrealm.model.User;
import com.novelrealm.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.register(
                request.pseudo(),
                request.email(),
                request.password());
        // On renvoie une réponse avec les données de l'utilisateur créé, sans le mot de passe pour prévoir la gestion de la session plus tard
        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
