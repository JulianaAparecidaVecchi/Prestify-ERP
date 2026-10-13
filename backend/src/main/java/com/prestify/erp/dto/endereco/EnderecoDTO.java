package com.prestify.erp.dto.endereco;

import com.prestify.erp.entity.Endereco;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Locale;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EnderecoDTO {

    @Size(max = 150, message = "O logradouro deve ter no máximo 150 caracteres.")
    private String logradouro;

    @Size(max = 20, message = "O número deve ter no máximo 20 caracteres.")
    private String numero;

    @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres.")
    private String complemento;

    @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
    private String bairro;

    @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
    private String cidade;

    @Size(max = 2, message = "O estado deve ter 2 caracteres (UF).")
    private String estado;

    @Size(max = 9, message = "O CEP deve ter no máximo 9 caracteres.")
    private String cep;

    public void aplicarEm(Endereco endereco) {
        Objects.requireNonNull(endereco, "O endereço de destino não pode ser nulo.");

        String cepNormalizado = normalizarTexto(cep);
        String estadoNormalizado = normalizarTexto(estado);

        endereco.setCep(cepNormalizado == null ? null : cepNormalizado.replaceAll("\\D", ""));
        endereco.setLogradouro(normalizarTexto(logradouro));
        endereco.setNumero(normalizarTexto(numero));
        endereco.setComplemento(normalizarTexto(complemento));
        endereco.setBairro(normalizarTexto(bairro));
        endereco.setCidade(normalizarTexto(cidade));
        endereco.setEstado(estadoNormalizado == null ? null : estadoNormalizado.toUpperCase(Locale.ROOT));
    }

    public static EnderecoDTO fromEntity(Endereco endereco) {
        if (endereco == null) {
            return null;
        }

        EnderecoDTO dto = new EnderecoDTO();
        dto.setLogradouro(endereco.getLogradouro());
        dto.setNumero(endereco.getNumero());
        dto.setComplemento(endereco.getComplemento());
        dto.setBairro(endereco.getBairro());
        dto.setCidade(endereco.getCidade());
        dto.setEstado(endereco.getEstado());
        dto.setCep(endereco.getCep());
        return dto;
    }

    public Endereco toEntity() {
        Endereco endereco = new Endereco();
        aplicarEm(endereco);
        return endereco;
    }

    private static String normalizarTexto(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }
}