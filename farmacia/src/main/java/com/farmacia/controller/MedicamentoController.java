package com.farmacia.controller;

import com.farmacia.model.Medicamento;
import com.farmacia.service.MedicamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicamentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicamentoController {

    private final MedicamentoService service;

    @GetMapping
    public ResponseEntity<List<Medicamento>> listar(
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String categoria) {
        if (nome != null) return ResponseEntity.ok(service.buscarPorNome(nome));
        if (categoria != null) return ResponseEntity.ok(service.buscarPorCategoria(categoria));
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicamento> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/estoque-baixo")
    public ResponseEntity<List<Medicamento>> estoqueBaixo() {
        return ResponseEntity.ok(service.listarEstoqueBaixo());
    }

    @GetMapping("/vencendo")
    public ResponseEntity<List<Medicamento>> vencendo(
            @RequestParam(defaultValue = "30") int dias) {
        return ResponseEntity.ok(service.listarVencendo(dias));
    }

    @GetMapping("/vencidos")
    public ResponseEntity<List<Medicamento>> vencidos() {
        return ResponseEntity.ok(service.listarVencidos());
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<String>> categorias() {
        return ResponseEntity.ok(service.listarCategorias());
    }

    @PostMapping
    public ResponseEntity<Medicamento> criar(@Valid @RequestBody Medicamento medicamento) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(medicamento));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicamento> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Medicamento medicamento) {
        return ResponseEntity.ok(service.atualizar(id, medicamento));
    }

    @PatchMapping("/{id}/estoque")
    public ResponseEntity<Void> ajustarEstoque(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        service.ajustarEstoque(id, body.get("quantidade"));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
