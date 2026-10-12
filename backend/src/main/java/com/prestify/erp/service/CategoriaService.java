package com.prestify.erp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.prestify.erp.dto.categoria.CategoriaRequestDTO;
import com.prestify.erp.dto.categoria.CategoriaResponseDTO;
import com.prestify.erp.entity.Categoria;
import com.prestify.erp.enums.TipoCategoria;
import com.prestify.erp.exception.CategoriaExceptions.CategoriaDuplicadaException;
import com.prestify.erp.exception.CategoriaExceptions.CategoriaNaoEncontradaException;
import com.prestify.erp.repository.CategoriaRepository;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional
    public CategoriaResponseDTO cadastrar(
            CategoriaRequestDTO dados,
            Long organizacaoId) {

        validarNomeDuplicado(
            dados.getNome(),
            dados.getTipo(),
            organizacaoId,
            null
        );

        Categoria categoria = new Categoria();

        categoria.setNome(dados.getNome().trim());
        categoria.setTipo(dados.getTipo());
        categoria.setOrganizacaoId(organizacaoId);

        Categoria categoriaSalva = categoriaRepository.save(categoria);

        return converterParaResponse(categoriaSalva);
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listar(
            TipoCategoria tipo,
            Long organizacaoId) {

        // Sem tipo: devolve todas as categorias da organização
        List<Categoria> categorias = (tipo == null)
            ? categoriaRepository.findAllByOrganizacaoId(organizacaoId)
            : categoriaRepository.findAllByOrganizacaoIdAndTipo(organizacaoId, tipo);

        return categorias
            .stream()
            .map(this::converterParaResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarPorId(
            Long id,
            Long organizacaoId) {

        Categoria categoria = buscarCategoria(id, organizacaoId);

        return converterParaResponse(categoria);
    }

    @Transactional
    public CategoriaResponseDTO atualizar(
            Long id,
            CategoriaRequestDTO dados,
            Long organizacaoId) {

        Categoria categoria = buscarCategoria(id, organizacaoId);

        validarNomeDuplicado(
            dados.getNome(),
            dados.getTipo(),
            organizacaoId,
            id
        );

        categoria.setNome(dados.getNome().trim());
        categoria.setTipo(dados.getTipo());

        Categoria categoriaAtualizada = categoriaRepository.save(categoria);

        return converterParaResponse(categoriaAtualizada);
    }

    @Transactional
    public void excluir(Long id, Long organizacaoId) {
        Categoria categoria = buscarCategoria(id, organizacaoId);

        categoriaRepository.delete(categoria);
    }

    private Categoria buscarCategoria(Long id, Long organizacaoId) {
        return categoriaRepository
            .findByIdAndOrganizacaoId(id, organizacaoId)
            .orElseThrow(CategoriaNaoEncontradaException::new);
    }

    private void validarNomeDuplicado(
            String nome,
            TipoCategoria tipo,
            Long organizacaoId,
            Long idIgnorado) {

        boolean existe = categoriaRepository
            .existsByNomeIgnoreCaseAndTipoAndOrganizacaoId(
                nome.trim(),
                tipo,
                organizacaoId
            );

        if (existe) {
            boolean mesmaCategoria = idIgnorado != null
                && categoriaRepository
                    .findByIdAndOrganizacaoId(idIgnorado, organizacaoId)
                    .map(categoria ->
                        categoria.getNome().equalsIgnoreCase(nome.trim())
                        && categoria.getTipo() == tipo
                    )
                    .orElse(false);

            if (!mesmaCategoria) {
                throw new CategoriaDuplicadaException();
            }
        }
    }

    private CategoriaResponseDTO converterParaResponse(Categoria categoria) {
        return new CategoriaResponseDTO(
            categoria.getId(),
            categoria.getNome(),
            categoria.getTipo()
        );
    }
}