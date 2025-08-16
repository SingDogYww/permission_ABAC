package com.cxyxh.permission.auth.control;

import com.cxyxh.permission.common.api.Result;
import com.cxyxh.permission.security.userdetail.SecurityUser;
import com.cxyxh.permission.user.dto.UserDTO;
import com.cxyxh.permission.user.service.UserService;
import com.cxyxh.permission.utils.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth/")
public class AuthController {

    @Autowired
    private JwtUtils jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Value("${security.jwt.header}")
    private String jwtHeader;
    @Value("${security.jwt.prefix}")
    private String jwtPrefix;
    @Value("${security.jwt.cookie-name}")
    private String jwtCookieName;
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<String> login(@RequestBody UserDTO login, HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            login.getUsername(),
                            login.getPassword())
            );
            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();
            String token = jwtUtil.generateToken(securityUser);
            response.addHeader(jwtHeader, jwtPrefix + ":"+ token);
            setJwtCookie(response, token);
            return Result.success();
        } catch (BadCredentialsException e) {
            return Result.failed("用户名或密码错误");
        }


    }

    @PostMapping("/register")
    public Result<UserDTO> register(@RequestBody UserDTO login) {
        userService.addUser(login);
        return Result.success();
    }

    private void setJwtCookie(HttpServletResponse response, String jwt) {
        ResponseCookie cookie = ResponseCookie.from(jwtCookieName, jwt)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofHours(24))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
