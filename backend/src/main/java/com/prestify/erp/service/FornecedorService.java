package com.prestify.erp.service;

import com.prestify.erp.common.exception.RecursoNaoEncontradoException;
import com.prestify.erp.dto.fornecedor.FornecedorDTO;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.repository.FornecedorRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository repository;
    private final FornecedorCadastroService cadastroService;

    public FornecedorService(FornecedorRepository repository, FornecedorCadastroService cadastroService) {
        this.repository = repository;
        this.cadastroService = cadastroService;
    }

    public List<FornecedorDTO> listarTodos() {
        return repository.findAll().stream().map(FornecedorDTO::fromEntity).toList();
    }

    public FornecedorDTO buscarPorId(Long id) {
        return FornecedorDTO.fromEntity(buscarEntidade(id));
    }

    public FornecedorDTO cadastrar(FornecedorDTO dto) {
        Fornecedor salvo = cadastroService.cadastrar(dto.toEntity());
        return FornecedorDTO.fromEntity(salvo);
    }

    public FornecedorDTO atualizar(Long id, FornecedorDTO dto) {
        Fornecedor existente = buscarEntidade(id);
        existente.setNome(dto.nome());
        existente.setEmail(dto.email());
        existente.setTelefone(dto.telefone());
        existente.setEndereco(dto.endereco());
        return FornecedorDTO.fromEntity(repository.save(existente));
    }

    public void remover(Long id) {
        Fornecedor existente = buscarEntidade(id);
        repository.delete(existente);
    }

    private Fornecedor buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fornecedor não encontrado: id " + id));
    }
}