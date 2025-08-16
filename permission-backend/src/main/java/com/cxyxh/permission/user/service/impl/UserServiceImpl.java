package com.cxyxh.permission.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cxyxh.permission.user.convert.UserConvert;
import com.cxyxh.permission.user.dto.UserDTO;
import com.cxyxh.permission.user.entity.User;
import com.cxyxh.permission.user.mapper.UserMapper;
import com.cxyxh.permission.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserConvert userConvert;


    public UserDTO addUser(UserDTO userDTO) {
        User user = userConvert.dtoToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreateTime(LocalDateTime.now());
        save(user);
        return userDTO;
    }


    @Override
    public User getUserByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<User>();
        queryWrapper.eq("username", username);
        return getOne(queryWrapper);
    }

    @Override
    public UserDTO getUserById(int id) {
        User user = getById(id);
        return userConvert.entityToVO(user);
    }

    @Override
    public UserDTO updateUser(UserDTO userDTO) {
        User user = userConvert.dtoToEntity(userDTO);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setUpdateTime(LocalDateTime.now());
        updateById(user);
        return userDTO;
    }
}
