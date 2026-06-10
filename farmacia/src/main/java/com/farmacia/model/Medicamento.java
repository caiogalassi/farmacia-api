package com.farmacia.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medicamentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Principio ativo e obrigatorio")
    @Column(name = "principio_ativo", nullable = false)
    private String principioAtivo;

    @NotBlank(message = "Categoria e obrigatoria")
    private String categoria;

    private String fabricante;

    @NotNull(message = "Quantidade e obrigatoria")
    @Min(value = 0, message = "Quantidade nao pode ser negativa")
    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "quantidade_minima")
    @Builder.Default
    private Integer quantidadeMinima = 10;

    @NotNull(message = "Preco e obrigatorio")
    @DecimalMin(value = "0.01", message = "Preco deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Column(name = "codigo_barras", unique = true)
    private String codigoBarras;

    @Column(name = "requer_receita")
    @Builder.Default
    private Boolean requerReceita = false;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }

    public boolean isEstoqueBaixo() {
        return quantidade <= quantidadeMinima;
    }

    public boolean isVencido() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }

    public boolean isVencendoEmBreve() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now().plusDays(30));
    }
}
