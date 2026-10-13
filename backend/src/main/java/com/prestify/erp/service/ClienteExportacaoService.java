package com.prestify.erp.service;

import com.prestify.erp.dto.cliente.ClienteResponseDTO;
import com.prestify.erp.dto.endereco.EnderecoDTO;
import com.prestify.erp.enums.TipoPessoa;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Gera arquivos em memória a partir dos clientes reais da organização. */
@Service
public class ClienteExportacaoService {

    private static final float MARGEM = 36;
    private static final float TAMANHO_FONTE = 9;
    private static final float ALTURA_LINHA = 12;
    private static final Color ROXO = new Color(79, 48, 167);

    private final ClienteService clienteService;

    public ClienteExportacaoService(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    public byte[] exportarCsv(
            Long organizacaoId, String busca, TipoPessoa tipoPessoa,
            Boolean ativo, String estado) {

        List<ClienteResponseDTO> clientes = clienteService.listarParaExportacao(
            organizacaoId, busca, tipoPessoa, ativo, estado
        );

        // BOM UTF-8 ajuda aplicativos de planilha a reconhecer os acentos.
        StringBuilder csv = new StringBuilder("\uFEFF");
        adicionarLinhaCsv(csv,
            "ID", "Tipo", "Cliente", "CPF", "CNPJ", "Nascimento", "Gênero",
            "Telefone", "E-mail", "CEP", "Rua", "Número", "Complemento",
            "Bairro", "Cidade", "Estado", "Status"
        );

        for (ClienteResponseDTO cliente : clientes) {
            EnderecoDTO endereco = cliente.getEndereco() == null
                ? new EnderecoDTO() : cliente.getEndereco();

            adicionarLinhaCsv(csv,
                cliente.getId(), tipoCliente(cliente), cliente.getNome(),
                cliente.getCpf(), cliente.getCnpj(), cliente.getDataNascimento(),
                cliente.getGenero(), cliente.getTelefone(), cliente.getEmail(),
                endereco.getCep(), endereco.getLogradouro(), endereco.getNumero(),
                endereco.getComplemento(), endereco.getBairro(), endereco.getCidade(),
                endereco.getEstado(), cliente.isAtivo() ? "Ativo" : "Inativo"
            );
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportarPdf(
            Long organizacaoId, String busca, TipoPessoa tipoPessoa,
            Boolean ativo, String estado) {

        List<ClienteResponseDTO> clientes = clienteService.listarParaExportacao(
            organizacaoId, busca, tipoPessoa, ativo, estado
        );

        try (PDDocument documento = new PDDocument();
             ByteArrayOutputStream saida = new ByteArrayOutputStream()) {

            PDFont fonte = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont fonteNegrito = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDRectangle formato = new PDRectangle(
                PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth()
            );

            float larguraTabela = formato.getWidth() - 2 * MARGEM;
            float[] larguras = {150, 35, 105, 85, 145, larguraTabela - 570, 50};
            String[] titulos = {"Cliente", "Tipo", "CPF/CNPJ", "Telefone", "E-mail", "Endereço", "Status"};
            String geradoEm = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo"))
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

            int indice = 0;
            do {
                PDPage pagina = new PDPage(formato);
                documento.addPage(pagina);

                try (PDPageContentStream conteudo = new PDPageContentStream(documento, pagina)) {
                    float topo = formato.getHeight() - MARGEM;
                    conteudo.setNonStrokingColor(ROXO);
                    escreverTexto(conteudo, fonteNegrito, 18, MARGEM, topo, "Prestify | Clientes");
                    conteudo.setNonStrokingColor(Color.DARK_GRAY);
                    escreverTexto(conteudo, fonte, 9, MARGEM, topo - 20,
                        "Organização: " + organizacaoId + " | Total: " + clientes.size() + " | Gerado em: " + geradoEm);
                    List<String> filtros = quebrarLinhas(
                        resumoFiltros(busca, tipoPessoa, ativo, estado), fonte, larguraTabela
                    );
                    for (int linha = 0; linha < filtros.size(); linha++) {
                        escreverTexto(conteudo, fonte, 8, MARGEM, topo - 35 - linha * 10,
                            filtros.get(linha));
                    }

                    float y = topo - 40 - filtros.size() * 10;
                    conteudo.setNonStrokingColor(ROXO);
                    conteudo.addRect(MARGEM, y - 25, larguraTabela, 25);
                    conteudo.fill();
                    conteudo.setNonStrokingColor(Color.WHITE);
                    float x = MARGEM;
                    for (int coluna = 0; coluna < titulos.length; coluna++) {
                        escreverTexto(conteudo, fonteNegrito, 9, x + 5, y - 16, titulos[coluna]);
                        x += larguras[coluna];
                    }
                    y -= 25;
                    float alturaDisponivel = y - (MARGEM + 20);

                    if (clientes.isEmpty()) {
                        conteudo.setNonStrokingColor(Color.DARK_GRAY);
                        escreverTexto(conteudo, fonte, 10, MARGEM + 5, y - 25,
                            "Nenhum cliente encontrado para os filtros selecionados.");
                    }

                    while (indice < clientes.size()) {
                        ClienteResponseDTO cliente = clientes.get(indice);
                        String[] valores = {
                            cliente.getNome(), tipoCliente(cliente),
                            cliente.getTipoPessoa() == TipoPessoa.FISICA ? cliente.getCpf() : cliente.getCnpj(),
                            cliente.getTelefone(), cliente.getEmail(), enderecoCompleto(cliente.getEndereco()),
                            cliente.isAtivo() ? "Ativo" : "Inativo"
                        };

                        List<List<String>> celulas = new ArrayList<>();
                        int quantidadeLinhas = 1;
                        for (int coluna = 0; coluna < valores.length; coluna++) {
                            List<String> linhas = quebrarLinhas(valores[coluna], fonte, larguras[coluna] - 10);
                            celulas.add(linhas);
                            quantidadeLinhas = Math.max(quantidadeLinhas, linhas.size());
                        }

                        float altura = quantidadeLinhas * ALTURA_LINHA + 12;
                        if (altura > alturaDisponivel) {
                            throw new IOException("Uma linha de cliente excede a altura disponível na página.");
                        }
                        if (y - altura < MARGEM + 20) break;

                        conteudo.setNonStrokingColor(indice % 2 == 0 ? new Color(248, 248, 248) : Color.WHITE);
                        conteudo.addRect(MARGEM, y - altura, larguraTabela, altura);
                        conteudo.fill();
                        conteudo.setNonStrokingColor(Color.DARK_GRAY);
                        x = MARGEM;
                        for (int coluna = 0; coluna < celulas.size(); coluna++) {
                            List<String> linhas = celulas.get(coluna);
                            for (int linha = 0; linha < linhas.size(); linha++) {
                                escreverTexto(conteudo, fonte, TAMANHO_FONTE, x + 5,
                                    y - 14 - linha * ALTURA_LINHA, linhas.get(linha));
                            }
                            x += larguras[coluna];
                        }

                        conteudo.setStrokingColor(Color.LIGHT_GRAY);
                        conteudo.setLineWidth(0.3f);
                        conteudo.moveTo(MARGEM, y - altura);
                        conteudo.lineTo(MARGEM + larguraTabela, y - altura);
                        conteudo.stroke();
                        y -= altura;
                        indice++;
                    }

                    conteudo.setNonStrokingColor(Color.DARK_GRAY);
                    escreverTexto(conteudo, fonte, 8, MARGEM, 22,
                        "Prestify ERP | Página " + documento.getNumberOfPages());
                }
            } while (indice < clientes.size());

            documento.save(saida);
            return saida.toByteArray();
        } catch (IOException exception) {
            throw new UncheckedIOException("Não foi possível gerar o PDF de clientes.", exception);
        }
    }

    private void adicionarLinhaCsv(StringBuilder csv, Object... valores) {
        String linha = Stream.of(valores).map(this::escaparCsv).collect(Collectors.joining(";"));
        csv.append(linha).append("\r\n");
    }

    private String escaparCsv(Object valor) {
        String texto = valor == null ? "" : valor.toString();
        // Evita que conteúdo cadastral seja interpretado como fórmula na planilha.
        String inicio = texto.stripLeading();
        if (!inicio.isEmpty() && "=+-@".indexOf(inicio.charAt(0)) >= 0) {
            texto = "'" + texto;
        }
        return "\"" + texto.replace("\"", "\"\"") + "\"";
    }

    private String tipoCliente(ClienteResponseDTO cliente) {
        return cliente.getTipoPessoa() == TipoPessoa.FISICA ? "PF" : "PJ";
    }

    private String enderecoCompleto(EnderecoDTO endereco) {
        if (endereco == null) return "";
        return Stream.of(
            endereco.getLogradouro(), endereco.getNumero(), endereco.getComplemento(),
            endereco.getBairro(), endereco.getCidade(), endereco.getEstado(), endereco.getCep()
        ).filter(valor -> valor != null && !valor.isBlank()).collect(Collectors.joining(", "));
    }

    private String resumoFiltros(String busca, TipoPessoa tipoPessoa, Boolean ativo, String estado) {
        return "Filtros | Busca: " + (busca == null || busca.isBlank() ? "Todas" : busca.trim())
            + " | Tipo: " + (tipoPessoa == null ? "Todos" : tipoPessoa)
            + " | Status: " + (ativo == null ? "Todos" : ativo ? "Ativos" : "Inativos")
            + " | UF: " + (estado == null || estado.isBlank() ? "Todas" : estado.trim());
    }

    private List<String> quebrarLinhas(String valor, PDFont fonte, float largura) throws IOException {
        String restante = textoPdf(valor, fonte).trim();
        List<String> linhas = new ArrayList<>();
        while (!restante.isEmpty()) {
            int limite = 0;
            while (limite < restante.length()
                    && fonte.getStringWidth(restante.substring(0, limite + 1)) / 1000 * TAMANHO_FONTE <= largura) {
                limite++;
            }
            if (limite == restante.length()) {
                linhas.add(restante);
                break;
            }
            limite = Math.max(1, limite);
            int espaco = restante.lastIndexOf(' ', limite - 1);
            if (espaco > 0) limite = espaco;
            linhas.add(restante.substring(0, limite).trim());
            restante = restante.substring(limite).trim();
        }
        return linhas.isEmpty() ? List.of("") : linhas;
    }

    private String textoPdf(String valor, PDFont fonte) throws IOException {
        if (valor == null) return "";
        StringBuilder texto = new StringBuilder();
        for (int codigo : valor.replaceAll("\\s+", " ").codePoints().toArray()) {
            String caractere = new String(Character.toChars(codigo));
            try {
                fonte.encode(caractere);
                texto.append(caractere);
            } catch (IllegalArgumentException exception) {
                texto.append('?');
            }
        }
        return texto.toString();
    }

    private void escreverTexto(
            PDPageContentStream conteudo, PDFont fonte, float tamanho,
            float x, float y, String texto) throws IOException {

        conteudo.beginText();
        conteudo.setFont(fonte, tamanho);
        conteudo.newLineAtOffset(x, y);
        conteudo.showText(textoPdf(texto, fonte));
        conteudo.endText();
    }
}