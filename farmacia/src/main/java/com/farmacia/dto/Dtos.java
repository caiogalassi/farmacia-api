package com.farmacia.dto;

import com.farmacia.model.Medicamento;
import com.farmacia.model.Venda;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ==================== MEDICAMENTO ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class MedicamentoRequest {
    @NotBlank private String nome;
    @NotBlank private String principioAtivo;
    @NotBlank private String categoria;
    private String fabricante;
    @NotNull @Min(0) private Integer quantidade;
    private Integer quantidadeMinima;
    @NotNull @DecimalMin("0.01") private BigDecimal preco;
    private LocalDate dataValidade;
    private String codigoBarras;
    private Boolean requerReceita;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class MedicamentoResponse {
    private Long id;
    private String nome;
    private String principioAtivo;
    private String categoria;
    private String fabricante;
    private Integer quantidade;
    private Integer quantidadeMinima;
    private BigDecimal preco;
    private LocalDate dataValidade;
    private String codigoBarras;
    private Boolean requerReceita;
    private Boolean estoqueBaixo;
    private Boolean vencido;
    private Boolean vencendoEmBreve;
    private LocalDateTime criadoEm;

    public static MedicamentoResponse from(Medicamento m) {
        return MedicamentoResponse.builder()
                .id(m.getId())
                .nome(m.getNome())
                .principioAtivo(m.getPrincipioAtivo())
                .categoria(m.getCategoria())
                .fabricante(m.getFabricante())
                .quantidade(m.getQuantidade())
                .quantidadeMinima(m.getQuantidadeMinima())
                .preco(m.getPreco())
                .dataValidade(m.getDataValidade())
                .codigoBarras(m.getCodigoBarras())
                .requerReceita(m.getRequerReceita())
                .estoqueBaixo(m.isEstoqueBaixo())
                .vencido(m.isVencido())
                .vencendoEmBreve(m.isVencendoEmBreve())
                .criadoEm(m.getCriadoEm())
                .build();
    }
}

// ==================== CLIENTE ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class ClienteRequest {
    @NotBlank private String nome;
    @NotBlank private String cpf;
    @Email private String email;
    private String telefone;
    private String endereco;
    private LocalDate dataNascimento;
}

// ==================== VENDA ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class VendaRequest {
    private Long clienteId;
    @NotEmpty private List<ItemVendaRequest> itens;
    private BigDecimal desconto;
    @NotNull private Venda.FormaPagamento formaPagamento;
    private String observacao;
}

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class ItemVendaRequest {
    @NotNull private Long medicamentoId;
    @NotNull @Min(1) private Integer quantidade;
}

// ==================== DASHBOARD ====================

@Data @NoArgsConstructor @AllArgsConstructor @Builder
class DashboardResponse {
    private BigDecimal vendasHoje;
    private Long totalVendasHoje;
    private BigDecimal vendasMes;
    private Long totalClientes;
    private Long totalMedicamentos;
    private Integer medicamentosEstoqueBaixo;
    private Integer medicamentosVencendo;
    private BigDecimal ticketMedio;
}
