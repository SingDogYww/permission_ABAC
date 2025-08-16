package com.cxyxh.permission.user.control;

import com.cxyxh.permission.annotation.Permission;
import com.cxyxh.permission.common.api.Result;
import com.cxyxh.permission.user.convert.UserConvert;
import com.cxyxh.permission.user.dto.UserDTO;
import com.cxyxh.permission.user.entity.User;
import com.cxyxh.permission.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.List;

@RestController
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private UserConvert userConvert;


    @PostMapping("/user/add")
    public Result<UserDTO> addUser(UserDTO userDTO) {
        UserDTO user = userService.addUser(userDTO);
        return Result.success(user);
    }


    @GetMapping("/user/list")
    @Permission("hasAuthority('user:read')")
    public Result<List<UserDTO>> listUser() {
        List<User> list = userService.list();
        List<UserDTO> userDTOS = userConvert.entityListToVOList(list);
        return Result.success(userDTOS);
    }


    @GetMapping("/user/detail")
    @PreAuthorize("hasPermission(#id, 'user', 'view')")
    public Result<UserDTO> detail(@RequestParam("id") @Param("id") Integer id) {
        UserDTO user = userService.getUserById(id);
        return Result.success(user);
    }

    @PostMapping("/user/edit")
    @PreAuthorize("hasPermission('user', 'edit')")
    public Result<UserDTO> editUser(@RequestBody UserDTO userDTO) {
        UserDTO user = userService.updateUser(userDTO);
        return Result.success(user);
    }

}
