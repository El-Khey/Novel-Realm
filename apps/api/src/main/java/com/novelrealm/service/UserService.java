package com.novelrealm.service;

import org.springframework.stereotype.Service;

import com.novelrealm.model.User;
import com.novelrealm.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String pseudo, String email, String password) {
        // règle métier : email unique
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Cet email est déjà utilisé");
        }

        User user = new User(pseudo, email, password);
        return userRepository.save(user);
    }

    // public void Login(String email, String password) {
    //     Optional<User> user = userRepository.findByEmail(email);
    //     if (user == null || !user.get().getPassword().equals(password)) {
    //         throw new IllegalStateException("Email ou mot de passe incorrect");
    //     }
    // }
}