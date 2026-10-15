package com.prestify.erp.service;
 
import com.prestify.erp.dto.estoque.*;
import com.prestify.erp.entity.Categoria;
import com.prestify.erp.entity.MovimentacaoEstoque;
import com.prestify.erp.entity.Produto;
import com.prestify.erp.enums.TipoMovimentacaoEstoque;
import com.prestify.erp.enums.StatusEstoque;
import com.prestify.erp.factory.MovimentacaoFactory;
import com.prestify.erp.repository.CategoriaRepository;
import com.prestify.erp.repository.MovimentacaoEstoqueRepository;
import com.prestify.erp.repository.ProdutoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
 
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
 
@Service
public class EstoqueService {
 
    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final CategoriaRepository categoriaRepository;
 
    private final Map<TipoMovimentacaoEstoque, MovimentacaoFactory> factories =
            new EnumMap<>(TipoMovimentacaoEstoque.class);
 
    public EstoqueService(
            ProdutoRepository produtoRepository,
            MovimentacaoEstoqueRepository movimentacaoRepository,
            CategoriaRepository categoriaRepository,
            List<MovimentacaoFactory> listaFactories) {
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.categoriaRepository = categoriaRepository;
        listaFactories.forEach(f -> factories.put(f.getTipo(), f));
    }
 
    @Transactional
    public ProdutoResponseDTO cadastrarProduto(
            ProdutoRequestDTO dados,
            Long organizacaoId) {
 
        validarSku(dados.getCodigoSku(), organizacaoId, null);
 
        validarQuantidadeParaVenda(
                dados.getQuantidadeAtual(),
                dados.getQuantidadeParaVenda()
        );
 
        Produto produto = new Produto();
        preencherProduto(produto, dados, organizacaoId);
 
        Produto salvo = produtoRepository.save(produto);
 
        if (salvo.getQuantidadeAtual() > 0) {
            // Factory Method: a fábrica de ENTRADA cria a movimentação inicial
            MovimentacaoEstoque inicial = obterFactory(TipoMovimentacaoEstoque.ENTRADA).criar(
                    salvo,
                    organizacaoId,
                    salvo.getQuantidadeAtual(),
                    0,
                    salvo.getQuantidadeAtual(),
                    "Estoque inicial do cadastro"
            );
 
            movimentacaoRepository.save(inicial);
        }
 
        return converterProduto(salvo);
    }
 
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutos(Long organizacaoId) {
        return produtoRepository
                .findAllByOrganizacaoIdOrderByNomeAsc(organizacaoId)
                .stream()
                .map(this::converterProduto)
                .toList();
    }
 
    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarProduto(Long id, Long organizacaoId) {
        return converterProduto(buscarProdutoEntity(id, organizacaoId));
    }
 
    @Transactional
    public ProdutoResponseDTO atualizarProduto(
            Long id,
            ProdutoRequestDTO dados,
            Long organizacaoId) {
 
        Produto produto = buscarProdutoParaAtualizacao(id, organizacaoId);
 
        validarSku(dados.getCodigoSku(), organizacaoId, id);
 
        int quantidadeAtualOriginal = produto.getQuantidadeAtual();
 
        validarQuantidadeParaVenda(
                quantidadeAtualOriginal,
                dados.getQuantidadeParaVenda()
        );
 
        preencherProduto(produto, dados, organizacaoId);
 
        // O saldo total só pode ser alterado por movimentações.
        produto.setQuantidadeAtual(quantidadeAtualOriginal);
 
        return converterProduto(produtoRepository.save(produto));
    }
 
    @Transactional
    public void excluirProduto(Long id, Long organizacaoId) {
        Produto produto = buscarProdutoParaAtualizacao(id, organizacaoId);
 
        if (movimentacaoRepository.existsByOrganizacaoIdAndProdutoId(
                organizacaoId, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível excluir um produto que possui movimentações de estoque."
            );
        }
 
        produtoRepository.delete(produto);
    }
 
    @Transactional
    public MovimentacaoResponseDTO registrarMovimentacao(
            MovimentacaoRequestDTO dados,
            Long organizacaoId) {
 
        Produto produto = buscarProdutoParaAtualizacao(
                dados.getProdutoId(),
                organizacaoId
        );
 
        // Factory Method: escolhe a fábrica do tipo (ENTRADA, SAIDA ou AJUSTE)
        MovimentacaoFactory factory = obterFactory(dados.getTipo());
 
        int quantidade = dados.getQuantidade();
 
        if (dados.getTipo() != TipoMovimentacaoEstoque.AJUSTE
                && quantidade <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A quantidade deve ser maior que zero para entrada e saída."
            );
        }
 
        int anterior = produto.getQuantidadeAtual();
 
        // Cada fábrica conhece a regra de cálculo do seu tipo
        int nova = factory.calcularNovaQuantidade(anterior, quantidade);
 
        if (nova < 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A saída não pode deixar o estoque negativo."
            );
        }
 
        // Não permite que a quantidade destinada à venda
        // fique maior que o novo estoque total.
        if (produto.getQuantidadeParaVenda() > nova) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A movimentação deixaria a quantidade para venda maior que o estoque total. Ajuste a distribuição antes."
            );
        }
 
        produto.setQuantidadeAtual(nova);
        produtoRepository.save(produto);
 
        int quantidadeHistorico =
                factory.calcularQuantidadeHistorico(anterior, nova, quantidade);
 
        MovimentacaoEstoque movimentacao = factory.criar(
                produto,
                organizacaoId,
                quantidadeHistorico,
                anterior,
                nova,
                dados.getMotivo()
        );
 
        return converterMovimentacao(
                movimentacaoRepository.save(movimentacao)
        );
    }
 
    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listarMovimentacoes(
            Long organizacaoId,
            Long produtoId) {
 
        List<MovimentacaoEstoque> itens = produtoId == null
                ? movimentacaoRepository
                        .findAllByOrganizacaoIdOrderByDataCriacaoDesc(organizacaoId)
                : movimentacaoRepository
                        .findAllByOrganizacaoIdAndProdutoIdOrderByDataCriacaoDesc(
                                organizacaoId,
                                produtoId
                        );
 
        return itens.stream()
                .map(this::converterMovimentacao)
                .toList();
    }
 
    private MovimentacaoFactory obterFactory(TipoMovimentacaoEstoque tipo) {
        MovimentacaoFactory factory = factories.get(tipo);
 
        if (factory == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo de movimentação inválido."
            );
        }
 
        return factory;
    }
 
    private Produto buscarProdutoEntity(Long id, Long organizacaoId) {
        return produtoRepository.findByIdAndOrganizacaoId(id, organizacaoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Produto não encontrado."
                ));
    }
 
    private Produto buscarProdutoParaAtualizacao(
            Long id,
            Long organizacaoId) {
        return produtoRepository.buscarParaAtualizacao(id, organizacaoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Produto não encontrado."
                ));
    }
 
    @Transactional(readOnly = true)
    public ResumoEstoqueResponseDTO obterResumo(Long organizacaoId) {
        List<ProdutoResponseDTO> produtos = listarProdutos(organizacaoId);
 
        long normal = produtos.stream()
                .filter(p -> p.getStatusEstoque() == StatusEstoque.NORMAL)
                .count();
 
        long baixo = produtos.stream()
                .filter(p -> p.getStatusEstoque() == StatusEstoque.BAIXO)
                .count();
 
        long zerado = produtos.stream()
                .filter(p -> p.getStatusEstoque() == StatusEstoque.ZERADO)
                .count();
 
        return new ResumoEstoqueResponseDTO(
                produtos.size(),
                normal,
                baixo,
                zerado
        );
    }
 
    private void validarSku(
            String sku,
            Long organizacaoId,
            Long idIgnorado) {
 
        if (sku == null || sku.isBlank()) {
            return;
        }
 
        boolean duplicado = idIgnorado == null
                ? produtoRepository.existsByOrganizacaoIdAndCodigoSkuIgnoreCase(
                        organizacaoId, sku.trim())
                : produtoRepository
                        .existsByOrganizacaoIdAndCodigoSkuIgnoreCaseAndIdNot(
                                organizacaoId, sku.trim(), idIgnorado);
 
        if (duplicado) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Já existe um produto com esse SKU."
            );
        }
    }
 
    private void validarQuantidadeParaVenda(
            Integer quantidadeAtual,
            Integer quantidadeParaVenda) {
 
        if (quantidadeAtual == null || quantidadeParaVenda == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o estoque total e a quantidade destinada à venda."
            );
        }
 
        if (quantidadeAtual < 0 || quantidadeParaVenda < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "As quantidades não podem ser negativas."
            );
        }
 
        if (quantidadeParaVenda > quantidadeAtual) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A quantidade para venda não pode ser maior que o estoque total."
            );
        }
    }
 
    private void preencherProduto(
            Produto produto,
            ProdutoRequestDTO dados,
            Long organizacaoId) {
 
        produto.setOrganizacaoId(organizacaoId);
        produto.setNome(dados.getNome().trim());
 
        produto.setCodigoSku(
                dados.getCodigoSku() == null || dados.getCodigoSku().isBlank()
                        ? null
                        : dados.getCodigoSku().trim()
        );
 
        produto.setPrecoCusto(dados.getPrecoCusto());
        produto.setPrecoVenda(dados.getPrecoVenda());
        produto.setUnidade(dados.getUnidade().trim());
        produto.setValidade(dados.getValidade());
        produto.setQuantidadeMinima(dados.getQuantidadeMinima());
        produto.setQuantidadeParaVenda(dados.getQuantidadeParaVenda());
        produto.setAtivo(dados.getAtivo() == null || dados.getAtivo());
 
        if (dados.getCategoriaId() == null) {
            produto.setCategoria(null);
        } else {
            Categoria categoria = categoriaRepository
                    .findByIdAndOrganizacaoId(
                            dados.getCategoriaId(),
                            organizacaoId
                    )
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Categoria não encontrada para esta organização."
                    ));
 
            produto.setCategoria(categoria);
        }
 
        // O saldo inicial só é definido durante o cadastro.
        // Na edição, o saldo é preservado pelo método atualizarProduto.
        if (produto.getId() == null) {
            produto.setQuantidadeAtual(dados.getQuantidadeAtual());
        }
    }
 
    private ProdutoResponseDTO converterProduto(Produto p) {
        Long categoriaId = p.getCategoria() == null
                ? null
                : p.getCategoria().getId();
 
        String categoriaNome = p.getCategoria() == null
                ? null
                : p.getCategoria().getNome();
 
        return new ProdutoResponseDTO(
                p.getId(),
                p.getNome(),
                p.getCodigoSku(),
                p.getPrecoCusto(),
                p.getPrecoVenda(),
                p.getUnidade(),
                p.getValidade(),
                p.getQuantidadeMinima(),
                p.getQuantidadeAtual(),
                p.getQuantidadeParaVenda(),
                categoriaId,
                categoriaNome,
                p.isAtivo(),
                // Singleton: instância única da regra de status do estoque
                EstoqueManagerSingleton.getInstance().calcularStatus(
                        p.getQuantidadeAtual(),
                        p.getQuantidadeMinima()
                ),
                p.getDataCriacao(),
                p.getDataAtualizacao()
        );
    }
 
    private MovimentacaoResponseDTO converterMovimentacao(
            MovimentacaoEstoque m) {
 
        return new MovimentacaoResponseDTO(
                m.getId(),
                m.getProduto().getId(),
                m.getProduto().getNome(),
                m.getTipo(),
                m.getQuantidadeMovimentada(),
                m.getQuantidadeAnterior(),
                m.getQuantidadeNova(),
                m.getMotivo(),
                m.getDataCriacao()
        );
    }
}