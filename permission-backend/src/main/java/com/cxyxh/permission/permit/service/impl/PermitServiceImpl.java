package com.cxyxh.permission.permit.service.impl;

import com.cxyxh.permission.permit.service.PermitService;
import org.springframework.stereotype.Service;

@Service
public class PermitServiceImpl implements PermitService {


    public boolean hasPermission(Long userId, String resourceType, String action) {
        // 查询操作权限
        return true;
    }

    public boolean hasPermission(Long userId, String resourceType,
                                 String action, Long resourceId) {
        //TODO 查询数据权限
        return true;
    }
}
