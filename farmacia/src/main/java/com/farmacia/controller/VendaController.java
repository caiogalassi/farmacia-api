package com.farmacia.controller;

import com.farmacia.model.Venda;
import com.farmacia.service.VendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VendaController {

    private final VendaService service;

    @GetMapping
    public ResponseEntity<List<Venda>> listar(
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {

        if (clienteId != null) return ResponseEntity.ok(service.listarPorCliente(clienteId));
        if (inicio != null && fim != null) return ResponseEntity.ok(service.listarPorPeriodo(inicio, fim));
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venda> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Venda> criar(@RequestBody Map<String, Object> body) {
        Long clienteId = body.get("clienteId") != null
                ? Long.valueOf(body.get("clienteId").toString()) : null;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itens = (List<Map<String, Object>>) body.get("itens");

        BigDecimal desconto = body.get("desconto") != null
                ? new BigDecimal(body.get("desconto").toString()) : BigDecimal.ZERO;

        Venda.FormaPagamento pagamento = Venda.FormaPagamento.valueOf(
                body.get("formaPagamento").toString());

        String obs = body.get("observacao") != null ? body.get("observacao").toString() : null;

        Venda venda = service.criarVenda(clienteId, itens, desconto, pagamento, obs);
        return ResponseEntity.status(HttpStatus.CREATED).body(venda);
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<Venda> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelarVenda(id));
    }
}


@RestController
@RequestMapping("/api/financeiro")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class FinanceiroController {

    private final VendaService vendaService;

    @GetMapping("/resumo")
    public ResponseEntity<Map<String, Object>> resumo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        if (inicio == null) inicio = LocalDate.now().withDayOfMonth(1);
        if (fim == null) fim = LocalDate.now();

        return ResponseEntity.ok(vendaService.resumoFinanceiro(inicio, fim));
    }

    @GetMapping("/hoje")
    public ResponseEntity<Map<String, Object>> hoje() {
        return ResponseEntity.ok(vendaService.resumoFinanceiro(LocalDate.now(), LocalDate.now()));
    }
}
