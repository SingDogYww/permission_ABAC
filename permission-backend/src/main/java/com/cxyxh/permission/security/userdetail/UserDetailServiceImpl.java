package com.cxyxh.permission.security.userdetail;

import com.cxyxh.permission.permit.service.PermissionCacheService;
import com.cxyxh.permission.user.entity.User;
import com.cxyxh.permission.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserDetailServiceImpl implements UserDetailsService {

    @Autowired
    private UserService userService;
    @Autowired
    private PermissionCacheService permissionCacheService;



    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userService.getUserByUsername(username);
        Set<String> permissions = permissionCacheService.getPermissions(user.getId());
        return SecurityUser.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .enabled(user.getStatus() == 1)
                .authorities(permissions.stream().toList())
                .build();

    }
}
