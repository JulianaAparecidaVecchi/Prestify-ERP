package com.prestify.erp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prestify.erp.enums.StatusColaborador;
import com.prestify.erp.enums.Funcao;
import com.prestify.erp.dto.colaborador.ColaboradorRequestDTO;
import com.prestify.erp.dto.colaborador.ColaboradorResponseDTO;
import com.prestify.erp.entity.Colaborador;
import com.prestify.erp.entity.ColaboradorPF;
import com.prestify.erp.entity.ColaboradorPJ;
import com.prestify.erp.repository.ColaboradorRepository;
import com.prestify.erp.util.ValidadorDocumento;

import static com.prestify.erp.exception.ColaboradorExceptions.*;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ColaboradorService {

    private final ColaboradorRepository colaboradorRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ColaboradorResponseDTO cadastrar(
            ColaboradorRequestDTO dto, Long organizacaoId) {

        validarGerenciamento(null, dto.funcao());

        String email = normalizarEmail(dto.email());

        if (colaboradorRepository.existsByEmail(email)) {
            throw new EmailJaCadastradoException(email);
        }

        if (dto.senha() == null || dto.senha().isBlank()) {
            throw new DadosInvalidosException(
                "A senha do colaborador é obrigatória."
            );
        }

        Colaborador colaborador = switch (dto.tipoPessoa()) {
            case FISICA -> new ColaboradorPF();
            case JURIDICA -> new ColaboradorPJ();
        };

        preencherDadosDoTipo(colaborador, dto, organizacaoId, 0L);
        preencherDadosComuns(colaborador, dto, email);
        colaborador.setOrganizacaoId(organizacaoId);
        colaborador.setSenha(passwordEncoder.encode(dto.senha()));
        colaborador.setStatus(StatusColaborador.ATIVO);
        colaborador.setEndereco(dto.endereco().toEntity());

        return ColaboradorResponseDTO.fromEntity(
            colaboradorRepository.save(colaborador)
        );
    }

    /** Lista os colaboradores da organização, ordenados por nome. */
    @Transactional(readOnly = true)
    public Page<ColaboradorResponseDTO> listar(
            Long organizacaoId, String busca, int pagina, int tamanho) {

        if (pagina < 0) {
            throw new DadosInvalidosException(
                "A página deve ser maior ou igual a zero."
            );
        }

        if (tamanho < 1 || tamanho > 100) {
            throw new DadosInvalidosException(
                "A quantidade por página deve estar entre 1 e 100."
            );
        }

        String termo = busca == null ? "" : busca.trim().toLowerCase();
        String termoDocumento = termo.replaceAll("\\D", "");

        List<ColaboradorResponseDTO> filtrados = colaboradorRepository
            .findAllByOrganizacaoId(organizacaoId)
            .stream()
            .map(ColaboradorResponseDTO::fromEntity)
            .filter(c -> termo.isEmpty() || corresponde(c, termo, termoDocumento))
            .sorted(Comparator.comparing(
                ColaboradorResponseDTO::nome,
                String.CASE_INSENSITIVE_ORDER
            ))
            .toList();

        int inicio = (int) Math.min(
            (long) pagina * tamanho,
            filtrados.size()
        );
        int fim = Math.min(inicio + tamanho, filtrados.size());

        return new PageImpl<>(
            filtrados.subList(inicio, fim),
            PageRequest.of(pagina, tamanho),
            filtrados.size()
        );
    }

    private boolean corresponde(
            ColaboradorResponseDTO c, String termo, String termoDocumento) {

        return c.nome().toLowerCase().contains(termo)
            || c.email().toLowerCase().contains(termo)
            || (!termoDocumento.isEmpty()
                && c.documento().contains(termoDocumento));
    }

    @Transactional(readOnly = true)
    public ColaboradorResponseDTO buscarPorId(Long id, Long organizacaoId) {
        return ColaboradorResponseDTO.fromEntity(
            buscar(id, organizacaoId)
        );
    }

    @Transactional
    public ColaboradorResponseDTO atualizar(
            Long id, ColaboradorRequestDTO dto, Long organizacaoId) {

        Colaborador colaborador = buscar(id, organizacaoId);
        validarGerenciamento(colaborador, dto.funcao());

        if (dto.tipoPessoa() != colaborador.getTipoPessoa()) {
            throw new DadosInvalidosException(
                "Não é possível alterar o tipo (PF/PJ) do colaborador."
            );
        }

        String email = normalizarEmail(dto.email());

        if (!email.equals(colaborador.getEmail())
                && colaboradorRepository.existsByEmail(email)) {
            throw new EmailJaCadastradoException(email);
        }

        preencherDadosDoTipo(colaborador, dto, organizacaoId, id);
        preencherDadosComuns(colaborador, dto, email);
        dto.endereco().aplicarEm(colaborador.getEndereco());

        if (dto.senha() != null && !dto.senha().isBlank()) {
            colaborador.setSenha(passwordEncoder.encode(dto.senha()));
        }

        return ColaboradorResponseDTO.fromEntity(colaborador);
    }

    @Transactional
    public ColaboradorResponseDTO alterarStatus(
            Long id, boolean ativo, Long organizacaoId) {

        Colaborador colaborador = buscar(id, organizacaoId);
        validarGerenciamento(colaborador, colaborador.getFuncao());

        colaborador.setStatus(
            ativo ? StatusColaborador.ATIVO : StatusColaborador.INATIVO
        );

        return ColaboradorResponseDTO.fromEntity(colaborador);
    }

    @Transactional
    public void excluir(Long id, Long organizacaoId) {
        Colaborador colaborador = buscar(id, organizacaoId);
        validarGerenciamento(colaborador, colaborador.getFuncao());
        colaboradorRepository.delete(colaborador);
    }

    /** Somente administradores podem conceder ou gerenciar acesso de administrador. */
    private void validarGerenciamento(
            Colaborador colaborador, Funcao novaFuncao) {

        var autenticacao = SecurityContextHolder
            .getContext()
            .getAuthentication();

        if (autenticacao == null || !autenticacao.isAuthenticated()) {
            throw new AccessDeniedException(
                "É necessário autenticar uma conta para gerenciar colaboradores."
            );
        }

        boolean administrador = autenticacao.getAuthorities().stream()
            .anyMatch(autoridade ->
                autoridade.getAuthority().equals("ROLE_ADMINISTRADOR")
            );

        if (administrador) {
            return;
        }

        boolean analistaRh = autenticacao.getAuthorities().stream()
            .anyMatch(autoridade ->
                autoridade.getAuthority().equals("ROLE_ANALISTA_RH")
            );

        if (!analistaRh) {
            throw new AccessDeniedException(
                "Sua função não permite gerenciar colaboradores."
            );
        }

        if (novaFuncao == Funcao.ADMINISTRADOR
                || (colaborador != null
                    && colaborador.getFuncao() == Funcao.ADMINISTRADOR)) {
            throw new AccessDeniedException(
                "Somente administradores podem gerenciar contas de administrador."
            );
        }
    }

    private void preencherDadosComuns(
            Colaborador colaborador, ColaboradorRequestDTO dto, String email) {

        String telefone = dto.telefone().replaceAll("\\D", "");

        if (telefone.length() < 10 || telefone.length() > 11) {
            throw new DadosInvalidosException(
                "Telefone inválido. Informe DDD + número."
            );
        }

        colaborador.setEmail(email);
        colaborador.setTelefone(telefone);
        colaborador.setFuncao(dto.funcao());
        colaborador.setSalario(dto.salario());
    }

    /** Exige e grava os campos específicos de PF ou PJ. */
    private void preencherDadosDoTipo(
            Colaborador colaborador, ColaboradorRequestDTO dto,
            Long organizacaoId, Long ignorarId) {

        if (colaborador instanceof ColaboradorPF pf) {
            String cpf = documento(dto.cpf(), 11, "CPF");

            if (!ValidadorDocumento.INSTANCIA.cpfValido(cpf)) {
                throw new DadosInvalidosException("CPF inválido.");
            }

            exigir(dto.dataNascimento(), "A data de nascimento é obrigatória.");
            exigir(dto.dataAdmissao(), "A data de admissão é obrigatória.");
            exigir(dto.genero(), "O gênero é obrigatório.");

            if (colaboradorRepository.existeCpf(
                    organizacaoId, cpf, ignorarId)) {
                throw new DadosInvalidosException(
                    "Já existe um colaborador cadastrado com este CPF."
                );
            }

            pf.setNome(dto.nome().trim());
            pf.setCpf(cpf);
            pf.setDataNascimento(dto.dataNascimento());
            pf.setDataAdmissao(dto.dataAdmissao());
            pf.setGenero(dto.genero());
        } else if (colaborador instanceof ColaboradorPJ pj) {
            String cnpj = documento(dto.cnpj(), 14, "CNPJ");

            if (!ValidadorDocumento.INSTANCIA.cnpjValido(cnpj)) {
                throw new DadosInvalidosException("CNPJ inválido.");
            }

            if (dto.razaoSocial() == null || dto.razaoSocial().isBlank()) {
                throw new DadosInvalidosException(
                    "A razão social é obrigatória."
                );
            }

            exigir(
                dto.dataAbertura(),
                "A data de criação da empresa é obrigatória."
            );

            if (colaboradorRepository.existeCnpj(
                    organizacaoId, cnpj, ignorarId)) {
                throw new DadosInvalidosException(
                    "Já existe um colaborador cadastrado com este CNPJ."
                );
            }

            pj.setNomeFantasia(dto.nome().trim());
            pj.setRazaoSocial(dto.razaoSocial().trim());
            pj.setCnpj(cnpj);
            pj.setDataAbertura(dto.dataAbertura());
        }
    }

    private Colaborador buscar(Long id, Long organizacaoId) {
        return colaboradorRepository
            .findByIdAndOrganizacaoId(id, organizacaoId)
            .orElseThrow(ColaboradorNaoEncontradoException::new);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void exigir(Object valor, String mensagem) {
        if (valor == null) {
            throw new DadosInvalidosException(mensagem);
        }
    }

    private String documento(String valor, int tamanho, String rotulo) {
        String digitos = valor == null ? "" : valor.replaceAll("\\D", "");

        if (digitos.length() != tamanho) {
            throw new DadosInvalidosException(
                rotulo + " inválido: informe " + tamanho + " dígitos."
            );
        }

        return digitos;
    }
}