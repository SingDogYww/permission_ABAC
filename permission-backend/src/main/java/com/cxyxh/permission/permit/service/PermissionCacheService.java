package com.cxyxh.permission.permit.service;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class PermissionCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_KEY_PREFIX = "user_permissions:";

    public Set<String> getPermissions(Long userId) {
        String key = CACHE_KEY_PREFIX + userId;
        Set<String> permissions = (Set<String>) redisTemplate.opsForValue().get(key);
        if (CollectionUtils.isEmpty(permissions)) {
            permissions = loadPermissionsFromDB(userId);
            redisTemplate.opsForValue().set(key, permissions, 1, TimeUnit.HOURS);
        }
        permissions.add("user:read");
        return permissions;
    }

    private Set<String> loadPermissionsFromDB(Long userId) {
        // 获取用户权限
        List<String> permissions = new ArrayList<>();
        List<String> roles = new ArrayList<>();
        // 合并角色和权限
        Set<String> authorities = new HashSet<>();
        // 添加权限
        authorities.addAll(permissions);
        authorities.addAll(roles.stream()
                .map(role -> "ROLE_" + role)
                .toList());
        return authorities;
    }

}
