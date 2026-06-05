package com.novelrealm.controller;

import com.novelrealm.dto.UserResponse;
import com.novelrealm.model.User;
import com.novelrealm.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    

    @GetMapping
    public ResponseEntity<List<UserResponse>> findAll() {
        List<UserResponse> body = userService.findAll().stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getPseudo(),
                        user.getEmail(),
                        user.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        User user = userService.findById(id);

        UserResponse body = new UserResponse(
                user.getId(),
                user.getPseudo(),
                user.getEmail(),
                user.getCreatedAt());

        return ResponseEntity.ok(body);
    }
}
