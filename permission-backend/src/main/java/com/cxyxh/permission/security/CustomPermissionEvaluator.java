package com.cxyxh.permission.security;

import com.cxyxh.permission.permit.service.PermitService;
import com.cxyxh.permission.security.userdetail.SecurityUser;
import com.sun.security.auth.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 * 数据权限操作时确认
 */
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Autowired
    private PermitService permitService;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        // 获取当前用户
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return permitService.hasPermission(securityUser.getUserId(), targetDomainObject.getClass().getSimpleName(), permission.toString());
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
        return permitService.hasPermission(securityUser.getUserId(), targetType, permission.toString(), (Long) targetId);
    }
}
