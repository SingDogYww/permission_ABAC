package com.cxyxh.permission.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.cxyxh.permission.user.dto.UserDTO;
import com.cxyxh.permission.user.entity.User;

public interface UserService extends IService<User> {

    UserDTO addUser(UserDTO userDTO);

    User getUserByUsername(String username);

    UserDTO getUserById(int id);

    UserDTO updateUser(UserDTO userDTO);
}
