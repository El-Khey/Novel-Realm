package com.novelrealm.service;

import org.springframework.stereotype.Service;

import com.novelrealm.model.User;
import com.novelrealm.exception.UserNotFoundException;
import com.novelrealm.repository.UserRepository;
import com.novelrealm.exception.EmailAlreadyUsedException;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String pseudo, String email, String password) {
        // règle métier : email unique
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email); // Exception personnalisée pour gérer ce cas d'erreur spécifique
        }

        User user = new User(pseudo, email, password);
        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
    }

    // public void Login(String email, String password) {
    //     Optional<User> user = userRepository.findByEmail(email);
    //     if (user == null || !user.get().getPassword().equals(password)) {
    //         throw new IllegalStateException("Email ou mot de passe incorrect");
    //     }
    // }
}