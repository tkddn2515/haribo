package com.tkddn.haribo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@SpringBootApplication
public class HariboApplication {

	@Bean
	public ServerEndpointExporter serverEndpointExporter() {
			return new ServerEndpointExporter();
	}


	public static void main(String[] args) {
		SpringApplication.run(HariboApplication.class, args);
	}

}
