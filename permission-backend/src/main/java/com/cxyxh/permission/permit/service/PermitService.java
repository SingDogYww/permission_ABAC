package com.cxyxh.permission.permit.service;

public interface PermitService {
    public boolean hasPermission(Long userId, String resourceType, String action);
    public boolean hasPermission(Long userId, String resourceType,String action, Long resourceId);
}

