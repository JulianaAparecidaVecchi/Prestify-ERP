package com.prestify.erp.controller;
import com.prestify.erp.dto.servico.ServicoRequestDTO; import com.prestify.erp.dto.servico.ServicoResponseDTO; import com.prestify.erp.service.ServicoService; import jakarta.validation.Valid; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/servicos")
public class ServicoController {
 private final ServicoService service; public ServicoController(ServicoService service) { this.service=service; }
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public ServicoResponseDTO cadastrar(@Valid @RequestBody ServicoRequestDTO dados, @RequestParam Long organizacaoId) { return service.cadastrar(dados,organizacaoId); }
 @GetMapping public List<ServicoResponseDTO> listar(@RequestParam Long organizacaoId) { return service.listar(organizacaoId); }
 @GetMapping("/{id}") public ServicoResponseDTO buscar(@PathVariable Long id,@RequestParam Long organizacaoId) { return service.buscar(id,organizacaoId); }
 @PutMapping("/{id}") public ServicoResponseDTO atualizar(@PathVariable Long id,@Valid @RequestBody ServicoRequestDTO dados,@RequestParam Long organizacaoId) { return service.atualizar(id,dados,organizacaoId); }
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id,@RequestParam Long organizacaoId) { service.excluir(id,organizacaoId); }
}
