package com.novelrealm.service;

import com.novelrealm.exception.EmailAlreadyUsedException;
import com.novelrealm.exception.UserNotFoundException;
import com.novelrealm.model.User;
import com.novelrealm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.novelrealm.exception.InvalidCredentialsException;
import com.novelrealm.model.User.AuthProvider;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User register(String pseudo, String email, String rawPassword, AuthProvider provider) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException(email);
        }

        String hashedPassword = passwordEncoder.encode(rawPassword); // ← le hashage

        User user = new User(pseudo, email, hashedPassword,provider); // ← on stocke le hash
        User savedUser = userRepository.save(user);
        
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getPseudo());
        } catch (Exception e) {
            // Log the error but don't fail the registration
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
        return savedUser;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException());

        // Un compte Google n'a pas de mot de passe → login par mot de passe impossible.
        if (user.getProvider() == User.AuthProvider.GOOGLE) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }

    public User loginWithGoogle(String email, String pseudo) {
        // Stratégie A : on cherche un compte existant par email.
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Pas de compte → on en crée un "GOOGLE" (sans mot de passe).
                    User user = new User(pseudo, email, null, User.AuthProvider.GOOGLE);
                    User savedUser = userRepository.save(user);
                    try {
                        emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getPseudo());
                    } catch (Exception e) {
                        System.err.println("Failed to send welcome email: " + e.getMessage());
                    }
                    return savedUser;
                });
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
    }
    
}