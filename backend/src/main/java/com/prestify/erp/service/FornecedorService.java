package com.prestify.erp.service;

import com.prestify.erp.dto.fornecedor.FornecedorRequestDTO;
import com.prestify.erp.dto.fornecedor.FornecedorResponseDTO;
import com.prestify.erp.entity.Endereco;
import com.prestify.erp.entity.Fornecedor;
import com.prestify.erp.entity.FornecedorPF;
import com.prestify.erp.entity.FornecedorPJ;
import com.prestify.erp.repository.FornecedorPFRepository;
import com.prestify.erp.repository.FornecedorPJRepository;
import com.prestify.erp.repository.FornecedorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class FornecedorService {
 
    private final FornecedorRepository fornecedorRepository;
    private final FornecedorPFRepository fornecedorPFRepository;
    private final FornecedorPJRepository fornecedorPJRepository;
 
    public FornecedorService(
            FornecedorRepository fornecedorRepository,
            FornecedorPFRepository fornecedorPFRepository,
            FornecedorPJRepository fornecedorPJRepository) {
 
        this.fornecedorRepository = fornecedorRepository;
        this.fornecedorPFRepository = fornecedorPFRepository;
        this.fornecedorPJRepository = fornecedorPJRepository;
    }
 
    @Transactional
    public FornecedorResponseDTO cadastrar(
            FornecedorRequestDTO dados,
            Long organizacaoId) {
 
        Fornecedor fornecedor;
 
        switch (dados.getTipoPessoa()) {
            case FISICA -> {
                FornecedorPF pf = new FornecedorPF();
                preencherPessoaFisica(pf, dados, organizacaoId, null);
                fornecedor = pf;
            }
            case JURIDICA -> {
                FornecedorPJ pj = new FornecedorPJ();
                preencherPessoaJuridica(pj, dados, organizacaoId, null);
                fornecedor = pj;
            }
            default -> throw new IllegalArgumentException("Tipo de pessoa inválido.");
        }
 
        fornecedor.setOrganizacaoId(organizacaoId);
        preencherDadosComuns(fornecedor, dados);
 
        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }
 
    @Transactional(readOnly = true)
    public List<FornecedorResponseDTO> listar(Long organizacaoId) {
        return fornecedorRepository
            .findAllByOrganizacaoId(organizacaoId)
            .stream()
            .map(this::converterParaResponse)
            .toList();
    }
 
    @Transactional(readOnly = true)
    public FornecedorResponseDTO buscarPorId(Long id, Long organizacaoId) {
        return converterParaResponse(buscarFornecedor(id, organizacaoId));
    }
 
    @Transactional
    public FornecedorResponseDTO atualizar(
            Long id,
            FornecedorRequestDTO dados,
            Long organizacaoId) {
 
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
 
        if (fornecedor.getTipoPessoa() != dados.getTipoPessoa()) {
            throw new IllegalArgumentException(
                "Não é possível alterar o tipo de pessoa do fornecedor."
            );
        }
 
        if (fornecedor instanceof FornecedorPF pf) {
            preencherPessoaFisica(pf, dados, organizacaoId, id);
        } else if (fornecedor instanceof FornecedorPJ pj) {
            preencherPessoaJuridica(pj, dados, organizacaoId, id);
        }
 
        preencherDadosComuns(fornecedor, dados);
 
        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }

    @Transactional
    public void inativar(Long id, Long organizacaoId) {
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
        fornecedor.setAtivo(false);
        fornecedorRepository.save(fornecedor);
    }
 
    @Transactional
    public FornecedorResponseDTO reativar(Long id, Long organizacaoId) {
        Fornecedor fornecedor = buscarFornecedor(id, organizacaoId);
        fornecedor.setAtivo(true);
        return converterParaResponse(fornecedorRepository.save(fornecedor));
    }
 
    // ---------- PF ----------

    private void preencherPessoaFisica(
            FornecedorPF pf,
            FornecedorRequestDTO dados,
            Long organizacaoId,
            Long idAtual) {
 
        exigirTexto(dados.getNome(), "O nome é obrigatório.");
        exigirTexto(dados.getCpf(), "O CPF é obrigatório.");
 
        String cpf = somenteDigitos(dados.getCpf());
        if (cpf.length() != 11) {
            throw new IllegalArgumentException("CPF inválido. Deve conter 11 dígitos.");
        }
 
        boolean duplicado = (idAtual == null)
            ? fornecedorPFRepository.existsByCpfAndOrganizacaoId(cpf, organizacaoId)
            : fornecedorPFRepository.existsByCpfAndOrganizacaoIdAndIdNot(cpf, organizacaoId, idAtual);
 
        if (duplicado) {
            throw new IllegalArgumentException("Já existe um fornecedor com esse CPF.");
        }
 
        pf.setNome(dados.getNome().trim());
        pf.setCpf(cpf);
        pf.setDataNascimento(dados.getDataNascimento());
    }
 
    // ---------- PJ ----------
 
    private void preencherPessoaJuridica(
            FornecedorPJ pj,
            FornecedorRequestDTO dados,
            Long organizacaoId,
            Long idAtual) {
 
        exigirTexto(dados.getRazaoSocial(), "A razão social é obrigatória.");
        exigirTexto(dados.getCnpj(), "O CNPJ é obrigatório.");
 
        String cnpj = somenteDigitos(dados.getCnpj());
        if (cnpj.length() != 14) {
            throw new IllegalArgumentException("CNPJ inválido. Deve conter 14 dígitos.");
        }
 
        boolean duplicado = (idAtual == null)
            ? fornecedorPJRepository.existsByCnpjAndOrganizacaoId(cnpj, organizacaoId)
            : fornecedorPJRepository.existsByCnpjAndOrganizacaoIdAndIdNot(cnpj, organizacaoId, idAtual);
 
        if (duplicado) {
            throw new IllegalArgumentException("Já existe um fornecedor com esse CNPJ.");
        }
 
        pj.setRazaoSocial(dados.getRazaoSocial().trim());
        pj.setCnpj(cnpj);
    }
 
    private void preencherDadosComuns(Fornecedor fornecedor, FornecedorRequestDTO dados) {
        fornecedor.setSegmentoAtuacao(dados.getSegmentoAtuacao());
        fornecedor.setEmail(dados.getEmail());
        fornecedor.setTelefone(dados.getTelefone());
        fornecedor.setEndereco(
            dados.getEndereco() != null ? dados.getEndereco() : new Endereco()
        );
    }
 
    private Fornecedor buscarFornecedor(Long id, Long organizacaoId) {
        return fornecedorRepository
            .findByIdAndOrganizacaoId(id, organizacaoId)
            .orElseThrow(() -> new IllegalArgumentException("Fornecedor não encontrado."));
    }
 
    private void exigirTexto(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }
 
    private String somenteDigitos(String valor) {
        return valor.replaceAll("\\D", "");
    }
 
    private FornecedorResponseDTO converterParaResponse(Fornecedor fornecedor) {
        String nome = null;
        String cpf = null;
        LocalDate dataNascimento = null;
        String razaoSocial = null;
        String cnpj = null;
 
        if (fornecedor instanceof FornecedorPF pf) {
            nome = pf.getNome();
            cpf = pf.getCpf();
            dataNascimento = pf.getDataNascimento();
        } else if (fornecedor instanceof FornecedorPJ pj) {
            razaoSocial = pj.getRazaoSocial();
            cnpj = pj.getCnpj();
        }
 
        return new FornecedorResponseDTO(
            fornecedor.getId(),
            fornecedor.getTipoPessoa(),
            nome,
            cpf,
            dataNascimento,
            razaoSocial,
            cnpj,
            fornecedor.getSegmentoAtuacao(),
            fornecedor.getEmail(),
            fornecedor.getTelefone(),
            fornecedor.getEndereco(),
            fornecedor.isAtivo()
        );
    }
}