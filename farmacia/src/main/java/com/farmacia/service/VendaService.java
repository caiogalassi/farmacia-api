package com.farmacia.service;

import com.farmacia.exception.ResourceNotFoundException;
import com.farmacia.model.*;
import com.farmacia.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final MedicamentoService medicamentoService;
    private final ClienteService clienteService;

    public List<Venda> listarTodas() {
        return vendaRepository.findAll();
    }

    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venda nao encontrada: " + id));
    }

    public List<Venda> listarPorCliente(Long clienteId) {
        return vendaRepository.findByClienteId(clienteId);
    }

    public List<Venda> listarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
        return vendaRepository.findByPeriodo(inicio, fim);
    }

    @Transactional
    public Venda criarVenda(Long clienteId, List<Map<String, Object>> itensRequest,
                             BigDecimal desconto, Venda.FormaPagamento formaPagamento,
                             String observacao) {

        Venda venda = Venda.builder()
                .desconto(desconto != null ? desconto : BigDecimal.ZERO)
                .formaPagamento(formaPagamento)
                .observacao(observacao)
                .status(Venda.StatusVenda.PENDENTE)
                .build();

        if (clienteId != null) {
            venda.setCliente(clienteService.buscarPorId(clienteId));
        }

        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> item : itensRequest) {
            Long medId = Long.valueOf(item.get("medicamentoId").toString());
            int qtd = Integer.parseInt(item.get("quantidade").toString());

            Medicamento med = medicamentoService.buscarPorId(medId);

            if (med.isVencido()) {
                throw new IllegalArgumentException("Medicamento vencido: " + med.getNome());
            }
            if (med.getQuantidade() < qtd) {
                throw new IllegalArgumentException("Estoque insuficiente para: " + med.getNome()
                        + ". Disponivel: " + med.getQuantidade());
            }

            ItemVenda itemVenda = ItemVenda.builder()
                    .venda(venda)
                    .medicamento(med)
                    .quantidade(qtd)
                    .precoUnitario(med.getPreco())
                    .build();

            itens.add(itemVenda);
            total = total.add(med.getPreco().multiply(BigDecimal.valueOf(qtd)));

            medicamentoService.ajustarEstoque(medId, -qtd);
        }

        venda.setItens(itens);
        venda.setValorTotal(total);
        venda.setStatus(Venda.StatusVenda.CONCLUIDA);

        return vendaRepository.save(venda);
    }

    @Transactional
    public Venda cancelarVenda(Long id) {
        Venda venda = buscarPorId(id);
        if (venda.getStatus() == Venda.StatusVenda.CANCELADA) {
            throw new IllegalStateException("Venda ja cancelada");
        }

        // Devolver estoque
        if (venda.getItens() != null) {
            for (ItemVenda item : venda.getItens()) {
                medicamentoService.ajustarEstoque(item.getMedicamento().getId(), item.getQuantidade());
            }
        }

        venda.setStatus(Venda.StatusVenda.CANCELADA);
        return vendaRepository.save(venda);
    }

    // ==================== FINANCEIRO ====================

    public Map<String, Object> resumoFinanceiro(LocalDate inicio, LocalDate fim) {
        LocalDateTime ini = inicio.atStartOfDay();
        LocalDateTime fi = fim.atTime(23, 59, 59);

        BigDecimal totalVendas = vendaRepository.somarVendasPorPeriodo(ini, fi);
        Long qtdVendas = vendaRepository.contarVendasPorPeriodo(ini, fi);
        BigDecimal ticketMedio = qtdVendas > 0
                ? totalVendas.divide(BigDecimal.valueOf(qtdVendas), 2, java.math.RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return Map.of(
                "totalVendas", totalVendas,
                "quantidadeVendas", qtdVendas,
                "ticketMedio", ticketMedio,
                "periodo", Map.of("inicio", inicio, "fim", fim)
        );
    }
}
