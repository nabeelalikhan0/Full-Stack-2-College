package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    // The UI lives on the Vite dev server; send visitors of the API root there
    @GetMapping("/")
    public String home() {
        return "redirect:http://localhost:5173";
    }
}
