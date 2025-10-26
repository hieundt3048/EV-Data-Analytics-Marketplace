package com.evmarketplace.Service;

import com.evmarketplace.Pojo.User;
import com.evmarketplace.userrepo.UserRepository;
import com.evmarketplace.Pojo.Role;
import com.evmarketplace.userrepo.RoleRepository;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public User register(String name, String email, String rawPassword) {
        String hashed = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        User u = new User(name, email, hashed);
        return userRepository.save(u);
    }

    // overload to accept organization and provider approval flag
    public User register(String name, String email, String rawPassword, String organization, boolean providerApproved) {
        String hashed = BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        User u = new User(name, email, hashed);
        u.setOrganization(organization);
        u.setProviderApproved(providerApproved);
        return userRepository.save(u);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public java.util.List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public boolean approveProvider(Long userId) {
        return userRepository.findById(userId).map(u -> {
            u.setProviderApproved(true);
            userRepository.save(u);
            return true;
        }).orElse(false);
    }

    public Set<Role> getRolesForUser(User user) {
        if (user == null) return java.util.Collections.emptySet();
        return user.getRoles();
    }

    public void assignRoleToUser(User user, String roleName) {
        if (user == null) return;
        Role r = roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
        user.addRole(r);
        userRepository.save(user);
    }

    public boolean checkPassword(User user, String rawPassword) {
        if (user == null || user.getPasswordHash() == null) return false;
        return BCrypt.checkpw(rawPassword, user.getPasswordHash());
    }
}
